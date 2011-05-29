// m.player
// (c) 2011 Enginimation Studio (http://enginimation.com).
// m.player may be freely distributed under the MIT license.
// For all details and documentation:
// https://github.com/podviaznikov/m.player
var util = require('util'),
    express = require('express'),
    connect = require('connect'),
    LastFmNode = require('lastfm').LastFmNode,
    lastfm = new LastFmNode({
        api_key: 'e3377f4b4d8c6de47c7e2c81485a65f5',
        secret: '99523abcd47bd54b5cfa10cf9bb81f20'
    });
    app = express.createServer();
app.configure(function()
{
    app.use(connect.favicon(__dirname + '/public/16.png'));
    //logger
    app.use(express.logger());
    //router
    app.use(app.router);
    //public folder for static files
    app.use(express.static(__dirname+'/public'));
});
app.get('/app.mf', function(req, res)
{
    res.header("Content-Type", "text/cache-manifest");
    res.sendfile(__dirname + '/app.mf');
});
app.get('/auth',function(req,res)
{
    var token = req.params.token,
        session = lastfm.session();
    util.log('TOKEN'+token);
    session.authorise(token, {
       handlers: {
          authorised: function(session) {
             util.log('AUTHORISED');
          }
       }
    });

});
app.listen(8083);
util.log('started app on 8083');