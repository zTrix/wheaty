/*
Copyright (c) 2010 Tim Caswell <tim@creationix.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

require.paths.unshift(__dirname);

require('./proto');
var Url = require('url'),
    Git = require('./git-fs'),
    Path = require('path'),
    Config = require('./config'),
    Renderers = require('./renderers'),
    Z = require('./zlog');

var routes = [];

function addRoute(regex, renderer) {
  routes.push({regex: regex, renderer: renderer});
}

function handleRoute(req, res, renderer, match) {
  function callback(err, data, response_code) {
    if (err) {
      var code = err.errno === process.ENOENT ? 404 : 500;
      Z.info(req.url + ' [ ' + code + ' ]');
      res.writeHead(code);
      res.write(err.stack);
      res.end();
      return;
    }
    if (!data) {
      res.writeHead(500);
      Z.info(req.url + ' [ 500 ]');
      res.write('Internal error, data is null');
    } else {
      if (!response_code) {
        response_code = 200;
      }
      res.writeHead(response_code, data.headers);
      Z.info(req.url + ' [ ' + response_code + ' ]');
      if (response_code == 200) {
        res.write(data.buffer);
      }
    }
    res.end();
  }
  renderer.apply(req, match.concat([callback]));
}

module.exports = function setup(repo, config) {
  
  for (var i in config) {
    Config[i] = config[i];
  }
  /*
  // if we want to lookup the skin dir relative to wheaty dir
  // use the code below
  Config['skin_dir'] = Path.normalize(Path.join(
    require('tools').relative_path(repo, Config.wheaty_dir),
    '..',
    Config.skin_dir
  ));
  */

  // Initialize the Git Filesystem
  Git(repo || process.cwd());
  // Set up our routes
  addRoute(/^\/()$/, Renderers.index);
  addRoute(/^\/()feed.xml$/, Renderers.feed);
  addRoute(/^\/([a-f0-9]{40})\/([a-z0-9_-]+)$/, Renderers.article);
  addRoute(/^\/([a-f0-9]{40})\/(.+\.dot)$/, Renderers.dotFile);
  addRoute(/^\/([a-f0-9]{40})\/(.+\.[a-z]{2,4})$/, Renderers.staticFile);
  addRoute(/^\/()([a-z0-9_-]+)$/, Renderers.article);
  addRoute(/^\/()(.+\.dot)$/, Renderers.dotFile);
  addRoute(/^\/()(.+\.[a-z]{2,4})$/, Renderers.staticFile);
  addRoute(/^\/()category\/([\%\.a-z0-9_-]+)$/,  Renderers.categoryIndex);


  return function handle(req, res) {
    try {
      var url = Url.parse(req.url);
      for (var i = 0, l = routes.length; i < l; i++) {
        var route = routes[i];
        var match = url.pathname.match(route.regex);
        if (match) {
          match = Array.prototype.slice.call(match, 1);
          if (match[0] === '') {
            // Resolve head to a sha if unspecified
            Git.getHead(function (err, sha) {
              if (err) {
                match[0] = 'fs';
              } else {
                match[0] = sha;
              }
              handleRoute(req, res, route.renderer, match);
            });
          } else {
            handleRoute(req, res, route.renderer, match);
          }
          return;
        }
      }
      // TODO need careful handling later
      res.writeHead(404);
      res.write('not found');
      res.end();
    } catch (err) {
      res.writeHead(500);
      res.write(err.stack);
      res.end();
    }
  }
};
