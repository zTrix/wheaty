var Git = require('./git-fs'),
    Path = require('path'),
    Data = require('./data'),
    Tools = require('./tools'),
    Buffer = require('buffer').Buffer,
    Prettify = require('./prettify'),
    MD5 = require('./md5'),
    ChildProcess = require('child_process'),
    getMime = require('./simple-mime')('application/octet-string'),
    Step = require('./step'),
    Z = require('./zlog'),
    fs = require('fs'),
    ServerName = 'Wheaty on node.js';

// Execute a child process, feed it a buffer and get a new buffer filtered.


function execPipe(command, args, data, callback) {
    var child = ChildProcess.spawn(command, args);
    var stdout = [],
        stderr = [],
        size = 0;
    child.stdout.on('data', function onStdout(buffer) {
        size += buffer.length;
        stdout[stdout.length] = buffer;
    });
    child.stderr.on('data', function onStderr(buffer) {
        stderr[stderr.length] = buffer;
    });
    child.on('error', function onExit(err) {
        callback(err);
    });
    child.on('exit', function onExit(code) {
        if (code > 0) {
            callback(new Error(stderr.join("")));
        } else {
            var buffer = new Buffer(size);
            var start = 0;
            for (var i = 0, l = stdout.length; i < l; i++) {
                var chunk = stdout[i];
                chunk.copy(buffer, start);
                start += chunk.length;
            }
            callback(null, buffer);
        }
    });
    if (typeof data === 'string') {
        child.stdin.write(data, "binary");
    } else {
        child.stdin.write(data);
    }
    child.stdin.end();
}

// This writes proper headers for caching and conditional gets
// Also gzips content if it's text based and stable.


function postProcess(headers, buffer, version, path, callback) {
    Step(
        function buildHeaders() {
            if (!headers["Content-Type"]) {
                headers["Content-Type"] = "text/html; charset=" + Config.encoding;
            }
            var date = new Date().toUTCString();
            headers["Date"] = date;
            headers["Server"] = ServerName;

            if (/html/.test(headers["Content-Type"])) {
                buffer = Tools.stringToBuffer((buffer + "").replace(/<pre><code>[^<]+<\/code><\/pre>/g, function applyHighlight(code) {
                    var code = code.match(/<code>([\s\S]+)<\/code>/)[1];
                    code = Prettify.prettyPrintOne(code)
                    return "<pre><code>" + code + "</code></pre>";
                }));
            }

            headers["Content-Length"] = buffer.length;

            return {
                headers: headers,
                buffer: buffer
            };
        }, 
        
        callback
    );
}

function insertSnippets(markdown, snippets, callback) {
    Step(
        function () {
            Tools.compileTemplate('snippet', this);
        }, 
        
        function (err, snippetTemplate) {
            if (err) {
                callback(err);
                return;
            }
            snippets.forEach(function (snippet) {
                var html = snippetTemplate({
                    snippet: snippet
                });
                markdown = markdown.replace(snippet.original, html);
            });
            return markdown;
        }, 
        
        callback
    )
}

var Renderers = module.exports = {
    index: Git.safe(function index(version, callback) {
        Step(
            function getHead() {
                Git.getHead(this);
            }, 
            
            function loadData(err, head) {
                if (err) {
                    callback(err);
                    return;
                }
                Data.articles(version, this.parallel());
                Git.readFile(head, Config.description_file, Config.encoding, this.parallel());
                Data.categories(version, this.parallel());
            }, 
            
            function applyTemplate(err, articles, description, categories) {
                if (err) {
                    callback(err);
                    return;
                }
                Tools.render("index", {
                    articles: articles,
                    description: description,
                    categories: categories,
                    config: Config
                }, this);
            }, 
            
            function callPostProcess(err, buffer) {
                if (err) {
                    callback(err);
                    return;
                }
                postProcess({
                    "Cache-Control": "public, max-age=600",
                    "ETag": MD5.md5(version + ":/:" + new Date().toUTCString())
                }, buffer, version, "index", this);
            }, 
            
            callback
        );
    }),

    feed: Git.safe(function feed(version, callback) {
        var articles;
        Step(

            function loadData() {
                Data.fullArticles(version, this);
            }, 
            
            function (err, data) {
                if (err) {
                    callback(err);
                    return;
                }
                articles = data;
                var group = this.group();
                articles.forEach(function (article) {
                    insertSnippets(article.markdown, article.snippets, group());
                });
            }, 
            
            function applyTemplate(err, markdowns) {
                if (err) {
                    callback(err);
                    return;
                }
                markdowns.forEach(function (markdown, i) {
                    articles[i].markdown = markdown;
                });
                Tools.render("feed.xml", {
                    articles: articles,
                    config: Config
                }, this, true);
            }, 
            
            function finish(err, buffer) {
                if (err) {
                    callback(err);
                    return;
                }
                postProcess({
                    "Content-Type": "application/rss+xml",
                    "Cache-Control": "public, max-age=600",
                    "ETag": MD5.md5(version + ":feed.xml:" + new Date().toUTCString())
                }, buffer, version, "feed.xml", this);
            }, 
            
            callback
        );
    }),

    article: Git.safe(function renderArticle(version, name, callback) {
        var article, description;
        Step(
            function loadData() {
                Git.getHead(this.parallel());
                Data.fullArticle(version, name, this.parallel());
            }, 
            
            function (err, head, props) {
                if (err) {
                    Z.err(err.stack);
                    callback(err);
                    return;
                }
                article = props;
                insertSnippets(article.markdown, article.snippets, this.parallel());
                Git.readFile(head, Config.description_file, Config.encoding, this.parallel());
            }, 
            
            function applyTemplate(err, markdown, description) {
                if (err) {
                    callback(err);
                    return;
                }
                article.markdown = markdown;
                Tools.render("article", {
                    title: article.title,
                    article: article,
                    author: article.author,
                    description: description,
                    config: Config
                }, this);
            }, 
            
            function finish(err, buffer) {
                if (err) {
                    Z.err(err.stack);
                    callback(err);
                    return;
                }
                if (!buffer) {
                    Z.warn('buffer is null');
                    return;
                }
                postProcess({
                    "Cache-Control": "public, max-age=600",
                    "ETag": MD5.md5(version + ":" + name + ":" + new Date().toUTCString())
                }, buffer, version, name, this);
            }, 
            
            callback
        );
    }),

    categoryIndex: Git.safe(function index(version, category, callback) {
        Step(

            function getHead() {
                Git.getHead(this);
            }, 
            
            function loadData(err, head) {
                if (err) {
                    callback(err);
                    return;
                }
                Data.articles(version, this.parallel());
                Git.readFile(head, Config.description_file, Config.encoding, this.parallel());
                Data.categories(version, this.parallel());
            }, 
            
            function applyTemplate(err, articles, description, categories) {
                if (err) {
                    callback(err);
                    return;
                }

                var articlesForCategory = articles.reduce(function (start, element) {
                    return element.categories && element.categories.indexOf(category) >= 0 ? start.concat(element) : start;
                }, []);
                Tools.render("index", {
                    articles: articlesForCategory,
                    description: description,
                    categories: categories,
                    config: Config
                }, this);
            }, 
            
            function callPostProcess(err, buffer) {
                if (err) {
                    callback(err);
                    return;
                }
                postProcess({
                    "Cache-Control": "public, max-age=600",
                    "ETag": MD5.md5(version + ":" + 'index' + ":" + new Date().toUTCString())
                }, buffer, version, "index", this);
            }, 
            
            callback
        );
    }),

    staticFile: Git.safe(function staticFile(version, path, callback) {
        var etag;
        try {
            var st = fs.statSync(Path.join(Config.app_root, Config.skin_dir, Config.theme, "public", path));
            etag = MD5.md5(version + ':' + path + ':' + st.size + ':' + st.mtime);
            if (this.headers['if-none-match'] === etag) {
                callback(null, {
                    headers: {
                        'Date': new Date().toUTCString(),
                        'Server': ServerName
                    },
                    buffer: ''
                }, 304);
                return;
            }
        } catch (e) {
            Z.err(e);
            etag = MD5.md5(version + ":" + path + ":" + new Date().toUTCString());
        }
        Step(

            function loadPublicFiles() {
                Git.readFile(version, Path.join(Config.skin_dir, Config.theme, "public", path), this);
            }, 
            
            function loadArticleFiles(err, data) {
                if (err) {
                    Git.readFile(version, Path.join(Config.article_dir, path), 'binary', this);
                }
                return data;
            }, 
            
            function processFile(err, string) {
                if (err) {
                    callback(err);
                    return;
                }
                var headers = {
                    "Content-Type": getMime(path),
                    "Cache-Control": "public, max-age=3600",
                    "ETag": etag
                };
                var buffer = new Buffer(string.length);
                buffer.write(string, 'binary');
                postProcess(headers, buffer, version, path, this);
            }, 
            
            callback
        );
    }),

    dotFile: Git.safe(function dotFile(version, path, callback) {
        Step(

            function loadPublicFiles() {
                Git.readFile(version, Path.join(Config.skin_dir, Config.theme, "public", path), this);
            }, 
            
            function loadArticleFiles(err, data) {
                if (err) {
                    Git.readFile(version, Path.join(Config.article_dir, path), Config.encoding, this);
                }
                return data;
            }, 
            
            function processFile(err, data) {
                if (err) {
                    callback(err);
                    return;
                }
                execPipe("dot", ["-Tpng"], data, this);
            }, 
            
            function finish(err, buffer) {
                if (err) {
                    callback(err);
                    return;
                }
                postProcess({
                    "Content-Type": "image/png",
                    "Cache-Control": "public, max-age=3600",
                    "ETag": MD5.md5(version + ":" + path + ":" + new Date().toUTCString())
                }, buffer, version, path, this);
            }, 
            
            callback
        );
    }),

    errorHandle: function (error_code, error_msg, callback) {
        Step(
            function loadTemplate() {
                Tools.render("error", {
                    http_code: error_code,
                    error_desc: error_code == 404 ? 'Not Found' : 'Internal Server Error',
                    error_msg: error_msg,
                    config: Config
                }, this, true);
            },

            function finish(err, data) {
                if (err) {
                    callback(null, {
                        headers: {},
                        buffer: 'error occurred when generating ' + error_code + ' page. original error code is :' + error_msg
                    }, 500);
                    return;
                }
                callback(null, {
                    headers: {
                        "Date": new Date().toUTCString(),
                        "Server": ServerName,
                        "Content-Type": "text/html; charset=" + Config.encoding,
                        "Content-Length": data.length
                    },
                    buffer: data
                }, error_code);
            }
        );
    }
}
