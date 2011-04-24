var util = require('util'),
    express = require('express'),
    connect = require('connect'),
    //mime = require('mime'),
    app = express.createServer();
//mime.define({'text/cache-manifest': ['mf']});
app.configure(function()
{
    app.use(connect.favicon(__dirname + '/public/16.png'));
    //logger
    app.use(express.logger());
    //router
    app.use(app.router);
    //public folder for static files
    app.use(express.static(__dirname + '/public'));
});
app.get('/app.mf', function(req, res)
{
    res.contentType('text/cache-manifest');
    res.sendfile(__dirname + '/public/app.mf');
});
app.listen(8090);

util.log('started on 8090');