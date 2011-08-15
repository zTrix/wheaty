
/**
 * Here is the configuration for your blog
 * 
 * Example blog code here: http://github.com/zTrix/blog
 * My blog: http://blog.ztrix.me
 */

var config = {

 // The following 4 configuration MUST be changed to your own value

    // Change it to your handle
    nickname: 'zTrix',

    // The domain for your blog
    blog_domain: 'blog.ztrix.me',

    // This is the short name provided by disqus.com.
    // If you do not have, go and register one for your blog in disqus.com.
    // Or if you do not provide one, the discussion module won't work.
    disqus_shortname: 'ztrix-blog',

    // Google analytic account
    // You can register for an account in http://www.google.com/analytics/
    // If you do not provide this account, the data analytic module
    //   won't work.
    ga_account: 'UA-10996727-4',

 // The following configuration indicates a file in which you introduce yourself
 // You MUST change them in this description_file
 // In this description file, the avatar points to an image under 
 // path: skin/black-tile/public/img/ if you didn't change `skin_dir` or `theme` variable below

    // This is the description file in which you describe your blog
    // or introduce yourself
    description_file: 'description.markdown',

 // Configuration below is optional 
 // Make sure you know exactly what you are doing when changing them

    // Skin dir which contains haml, css, javascript, img
    // you need not to change this if your themes are under `skin` dir
    skin_dir: 'skin',

    // theme folder under skin dir
    // you can write your own theme, and put it in a folder
    // then set the theme option to your theme folder name
    theme: 'black-tile',

    // article dir
    article_dir: 'articles',

    // authors dir, you should not change this if you are running
    // a personal blog
    author_dir: 'authors',

    // The port to be used for the server, default to 80
    listen_port: 80,

    // article encoding, it is strongly recommended to use utf-8 as
    // your article encoding
    // other encoding is not tested
    encoding: 'utf-8',

    // The following line is only used to 
    // keep the last comma above
    ____: ''
};


require('http').createServer(
    require('./wheaty/wheaty')(__dirname, config)
).listen(config.listen_port);

