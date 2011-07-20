
/**
 * Here is the configuration for your blog
 *
 */
var config = {
    // the port to be used for the server, default to 80
    listen_port: 80,

    // your handle
    nickname: 'zTrix',

    // blog base url
    base_url: 'blog.ztrix.me',

    // theme css
    // you can write your own css file in skin/public/css/ 
    // and set the below option to your own css file
    theme_css: 'default.css',

    // this is the short name provided by disqus.com
    // If you do not have, go and register one for your blog
    // in disqus.com
    disqus_shortname: 'ztrix-blog',

    // article dir
    article_dir: 'articles',
    //article_dir: 'art',

    // authors dir, you should not change this if you are running
    // a personal blog
    author_dir: 'authors',
    //author_dir: 'aut',

    // This is the description file in which you describe your blog
    // or introduce yourself
    description_file: 'description.markdown',

    // skin dir, which contains the haml, css, img, javascript files
    skin_dir: 'skin',
    //skin_dir: 'skins',

    // article encoding, it is strongly recommended to use utf-8 as
    // your article encoding
    // other encoding is not tested
    encoding: 'utf-8',

    // google analytic account
    ga_account: 'UA-10996727-4',

    // you need not to care about this line
    // it's only used to keep the last comma
    // above
    _nothing: ''
};


require('http').createServer(
    require('./wheaty/wheaty')(__dirname, config)
).listen(config.listen_port);


