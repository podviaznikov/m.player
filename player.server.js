/**(c) 2011 Enginimation Studio (http://enginimation.com). May be freely distributed under the MIT license.*/
var util = require('util'),
    express = require('express'),
    connect = require('connect'),
    fb = require('facebook-sdk'),
    LastFmNode = require('lastfm').LastFmNode,
    lastfm = new LastFmNode({
        api_key: 'e3377f4b4d8c6de47c7e2c81485a65f5',
        secret: '99523abcd47bd54b5cfa10cf9bb81f20'
    });
    app = express.createServer();
app.configure(function(){
    app.use(fb.facebook({ appId: '222066051151670', secret: 'e4f631a8fcadb28744da863a9bf00e43' }));
//    app.use(function(req, res, next) {
////        if (req.facebook.getSession()){
////           util.log('fb session is empty');
////           req.facebook.api('/me', function(me) {
////                console.log(me);
////
////                if (me.error) {
////                  console.log('An api error occured, so probably you logged out. Refresh to try it again...');
////                }
////                else {
////                  console.log('<a href="' + req.facebook.getLogoutUrl() + '">Logout</a>');
////                }
////            });
////        }
////        else {
////          util.log('fb session is empty');
////        }
//        next();
//    });
    app.use(connect.favicon(__dirname + '/public/16.png'));
    //logger
    app.use(express.logger());
    //component for decoding requests' params
    app.use(express.bodyParser());
    //session support
    app.use(express.cookieParser());
    app.use(express.session({secret: 'super_hard_session_secret',cookie:{ path: '/', httpOnly: true, maxAge: 14400000000000000 }}));
    //router
    app.use(app.router);
    //public folder for static files
    app.use(express.static(__dirname+'/public'));
});
app.get('/app.mf', function(req, res){
    res.header('Content-Type', 'text/cache-manifest');
    res.sendfile(__dirname + '/app.mf');
});
app.get('/session_data',function(req,res){
    if(req.facebook.getSession()){
        req.facebook.api('/me', function(me) {
            util.log(util.inspect(me));

            if(me.error){
              util.log('An api error occured, so probably you logged out. Refresh to try it again...');
            }
            else{
              util.log('<a href="' + req.facebook.getLogoutUrl() + '">Logout</a>');
            }
        });
        res.redirect('home');
        return;
    }
    res.contentType('application/json');
    var session=req.session;
    if(!session||!req.session.user||!req.session.key){
        res.send({
            user:'',
            key:'',
            fbLogoutURL:req.facebook.getLogoutUrl(),
            fbLoginURL:req.facebook.getLoginUrl()
        });
    }
    else{
        var user=req.session.user||'',
            key=req.session.key||'';
        util.log(util.inspect(session));
        res.send({
            user:user,
            key:key,
            fbLogoutURL:req.facebook.getLogoutUrl(),
            fbLoginURL:req.facebook.getLoginUrl()
        });
    }
});
app.post('/song_played/:artist/:track/:length',function(req,res){
    var user=req.query.user,
        key=req.query.key;
    util.log('scrobbling');
    util.log(user);
    util.log(key);
    if(user && key){
        scrobble(req.params.track,req.params.artist,req.params.length,key,user);
    }
});
app.get('/auth',function(req,res){
    var token = req.query.token,
        session = lastfm.session();
    util.log('token='+token);
    session.authorise(token, {
        handlers: {
            authorised: function(session) {
                util.log('authorised');
                util.log(util.inspect(req));
                util.log(util.inspect(session));
                req.session.user = session.user;
                req.session.key = session.key;
                res.redirect('home');
             }
        }
    });
});
app.get('/artist/:artistName/image',function(req,res){
    var image='css/images/no_picture.png';
    util.log('Getting image for='+req.params.artistName);
    var request = lastfm.request('artist.getInfo', {
        artist: req.params.artistName,
        handlers: {
            success: function(apiResp) {
                var data = JSON.parse(apiResp);
                if(data && data.artist && data.artist.image[2]){
                    image=data.artist.image[2]['#text']||'css/images/no_picture.png';
                }
                res.send(image);
            },
            error: function(error) {
                res.send(image);
            }
        }
    });
});
app.get('/artist/:artistName/bio',function(req,res){
    util.log('Getting bio for='+req.params.artistName);
    var bio={};
    var request = lastfm.request('artist.getInfo', {
        artist: req.params.artistName,
        handlers: {
            success: function(apiResp) {
                var data = JSON.parse(apiResp);
                if(data && data.artist && data.artist.bio){
                    bio=data.artist.bio;
                }
                res.contentType('application/json');
                res.send(bio);
            },
            error: function(error) {
                res.contentType('application/json');
                res.send(bio);
            }
        }
    });
});

app.get('/artist/:artistName/album/:albumTitle/image',function(req,res){
    var image='css/images/no_picture.png';
    util.log('Getting image for='+req.params.albumTitle);
    var request = lastfm.request('album.getInfo', {
        artist: req.params.artistName,
        album:  req.params.albumTitle,
        handlers: {
            success: function(apiResp) {
                var data = JSON.parse(apiResp);
                if(data && data.album && data.album.image[2]){
                    image=data.album.image[2]['#text']||'css/images/no_picture.png';
                }
                res.send(image);
            },
            error: function(error) {
                res.send(image);
            }
        }
    });
});
app.get('/artist/:artistName/album/:albumTitle/poster',function(req,res){
    var image='css/images/no_picture.png';
    util.log('Getting image for='+req.params.albumTitle);
    var request = lastfm.request('album.getInfo', {
        artist: req.params.artistName,
        album:  req.params.albumTitle,
        handlers: {
            success: function(apiResp) {
                var data = JSON.parse(apiResp);
                if(data && data.album && data.album.image[4]){
                    image=data.album.image[4]['#text']||'css/images/no_picture.png';
                }
                res.send(image);
            },
            error: function(error) {
                res.send(image);
            }
        }
    });
});
app.get('/artist/:artistName/album/:albumTitle/info',function(req,res){
    util.log('Getting image for='+req.params.albumTitle);
    var artist = req.params.artistName,
        album = req.params.albumTitle,
        request = lastfm.request('album.getInfo', {
        artist: artist,
        album:  album,
        handlers: {
            success: function(apiResp) {
                var data = JSON.parse(apiResp);
                data = data.album;
                if(!data){
                    var image='css/images/no_picture.png',
                        albumName=album,
                        releaseDate='no information',
                        songsCount='no information';
                    res.contentType('application/json');
                    res.send({image:image,name:albumName,releaseDate:releaseDate,songsCount:songsCount});
                }
                else{
                    var image = 'css/images/no_picture.png',
                        albumName = album,
                        releaseDate = data.releasedate.trim().split(',')[0]||'',//getting just date without time
                        songsCount = data.tracks.length||'';
                    if(data && data.image[2]){
                        image=data.image[2]['#text']||'css/images/no_picture.png';//medium
                    }

                    if(data&& data.name && data.name.trim()){
                        albumName=data.name.trim()||album
                    }

                    res.contentType('application/json');
                    res.send({image:image,name:albumName,releaseDate:releaseDate,songsCount:songsCount});
                }
           },
            error: function(error) {
                var image='css/images/no_picture.png',
                    albumName=album,
                    releaseDate='no information',
                    songsCount='no information';
                res.contentType('application/json');
                res.send({image:image,name:albumName,releaseDate:releaseDate,songsCount:songsCount});
            }
        }
    });
});
function scrobble(trackName,artist,trackLength,key,user){
     var session = lastfm.session(user,key),
         startedTime = Math.round(((new Date().getTime()) / 1000) - trackLength),
         LastFmUpdate = lastfm.update('scrobble', session, {
            track: {
                name:trackName,
                artist:{'#text':artist}
            },
            timestamp: startedTime
         });
     LastFmUpdate.on('success',function(track)
     {
        util.log('succesfull scrobble');
        util.log(util.inspect(track));
     });
     LastFmUpdate.on('error',function(track,error)
     {
        util.log(track);
        util.log(error);
        util.log('unsuccesfull scrobble='+error);
     });
};
app.listen(8083);
util.log('started app on 8083');