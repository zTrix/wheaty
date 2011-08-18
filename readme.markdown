# Wheaty

[Wheaty] is a Git powered node.js blog engine derived from [wheat]

## how to install
    git clone git://github.com/zTrix/wheaty.git wheaty
    cd wheaty
    node server.js

## node.js + Git + Markdown = Blog
This is a cool idea I got from [Tim Caswell] in his project [wheat]. It's powered by node.js, using `git` for both code and blog articles storage, since you are the only one who has access to git push, admin pages are not needed. And at last, it uses markdown for its blog paper format. Thus, a light-weight personal blog can be built.

It's so light-weighted and clean, with no redundant modules, easy to change as I need and easy to manager. All you have to do is to install and configura it and then write blogs and use `git push` to publish. The only thing that is not that easy is that you have to write markdown format blogs, which is not bearable for non-IT-geeks.

For me, who follows a light-weight style, always want to make things under control, and feel OK to write markdowns, it's so attractive to me. Further more, I have some node.js clouds at hand such as [no.de], [nodester], [cloudfoundry], it would be my pleasure to build my blog in this way.

But soon I found that, the original [wheat] still has bugs, and also I have some features that are not supported, so I began this project [wheaty], aiming at building a personal blog for me and anyone who has the same interest as me.

And I hold that, if you call yourself a geek, and you are a git follower and markdown writer like me, try this. 

## note
* wheaty uses utf-8 as its default encoding, and it's strongly recommended to use utf-8. Though it's designed to support other encodings, but not enough tests have been done.

## FAQ
* If you are testing code under local environment, and the disqus comment module won't load, try adding the following code in article.haml in the script
    var disqus_developer = 1;
* The introduction paragraph in index page of each article is the content before the first `<h2>` tag
* The date for you article can be any string recognisable by Javascript using `new Date(date)`

## Help
Please contact me([i@ztrix.me](mailto:i@ztrix.me)) if you need any help.

## License
Wheaty is [licensed] under the [MIT License]

## Tags
 blog engine, node.js, git, markdown, Javascript

[wheat]:https://github.com/creationix/wheat
[wheaty]:https://github.com/zTrix/wheaty
[licensed]:https://github.com/zTrix/wheaty/blob/master/LICENSE
[MIT License]:http://creativecommons.org/licenses/MIT/
[Tim Caswell]:https://github.com/creationix
[no.de]:http://no.de
[nodester]:http://nodester.com/
[cloudfoundry]:http://cloudfoundry.com/
