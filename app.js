/**(c) 2011 Enginimation Studio (http://enginimation.com). May be freely distributed under the MIT license.*/
var util=require('util'),
    express=require('express'),
    connect=require('connect'),
    appCache = require('connect-app-cache'),
    soundcloud=require('soundcloud'),
    nbs=require('nbs-api'),
    facebook=require('facebook-graph'),
    LastFmNode=require('lastfm').LastFmNode,
    lastfm=new LastFmNode({
        api_key:'e3377f4b4d8c6de47c7e2c81485a65f5',
        secret:'99523abcd47bd54b5cfa10cf9bb81f20'
    });
    app=express.createServer();
//init NBS api

nbs.init('mplayer');
app.configure(function(){
    app.use(connect.favicon(__dirname+'/public/16.png'));
    //logger
    app.use(express.logger());
    //component for decoding requests' params
    app.use(express.bodyParser());
    //session support
    app.use(express.cookieParser());
    app.use(express.session({secret:'super_hard_session_secret',cookie:{path:'/',httpOnly:true,maxAge:14400000}}));
    //router
    app.use(app.router);
    //public folder for static files
    app.use(express.static(__dirname+'/public'));
    //jade settings
    //set path to the views (template) directory
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.set('view options', {layout: false});
    app.use(appCache("app.mf",__dirname+"/app.mf",{maxAge:0}));
});
//index page
app.get('/', function(req,res){
   res.render('index',{filename:__dirname+'/views/index.jade'});
});

app.get('/fb/user',function(req,res){
    var accessToken=req.query.access_token;
    util.log('FB access token ready:',accessToken);
    res.contentType('application/json');
    var graph=new facebook.GraphAPI(accessToken);
    graph.getObject('me', function(error,data){
        if(error){
            util.log('Error:'+error);
            res.send({});
        }
        else{
            util.log('Data from FB:'+util.inspect(data));
            res.send(data);
        }
    });
});
app.get('/sc/user',function(req,res){
    var accessToken=req.query.access_token;
    util.log('SC access token ready:',accessToken);
    res.contentType('application/json');
    soundcloud.me(accessToken,function(data){
        util.log('SC profile received');
        if(data){
            util.log(util.inspect(data));
        }
        res.send(data);
    });
});
app.get('/sc/tracks',function(req,res){
    var accessToken=req.query.access_token;
    util.log('SC access token ready:',accessToken);
    res.contentType('application/json');
    soundcloud.myPrivateStreamableTracks(accessToken,function(data){
        util.log('SC resp:'+util.inspect(data));
        res.send(data);
    });
});
app.get('/session_data',function(req,res){
    var session=req.session;
    res.contentType('application/json');

    if(!session||!req.session.user||!req.session.key){
        res.send({
            user:'',
            key:''
        });
    }
    else{
        var user=req.session.user||'',
            key=req.session.key||'';
        util.log(util.inspect(session));
        res.send({
            user:user,
            key:key
        });
    }
});
app.post('/song_played',function(req,res){
    var track=req.query.track,
        artist=req.query.artist,
        length=req.query.length,
        user=req.query.user,
        key=req.query.key,
        accessToken=req.query.access_token;
    util.log('scrobbling'+user+key+accessToken);
    if(user && key){
        scrobble(track,artist,length,key,user);
    }
    if(accessToken){
        var graph=new facebook.GraphAPI(accessToken);
        graph.putObject('me', 'feed', {
            message: 'Listening '+artist+" '"+track+"' "
        },function(error,data){
            if(error){
                util.log('Error:'+error);
            }
            else{
                util.log('Data from FB:'+util.inspect(data));
             }
        });
    }
});
app.get('/auth',function(req,res){
    var token=req.query.token,
        session=lastfm.session();
    util.log('token='+token);
    session.authorise(token, {
        handlers: {
            authorised: function(session) {
                util.log('authorised');
                util.log(util.inspect(req));
                util.log(util.inspect(session));
                req.session.user=session.user;
                req.session.key=session.key;
                res.redirect('home');
             }
        }
    });
});
app.get('/artist/:artistName/image',function(req,res){
    var image='css/images/no_picture.png';
    util.log('Getting image for='+req.params.artistName);
    var request=lastfm.request('artist.getInfo',{
        artist: req.params.artistName,
        handlers:{
            success:function(apiResp) {
                var data=JSON.parse(apiResp);
                if(data && data.artist && data.artist.image[2]){
                    image=data.artist.image[2]['#text']||'css/images/no_picture.png';
                }
                res.send(image);
            },
            error:function(error) {
                res.send(image);
            }
        }
    });
});
app.get('/artist/:artistName/bio',function(req,res){
    util.log('Getting bio for='+req.params.artistName);
    var bio={},
        artistName=req.params.artistName;
    lastfm.request('artist.getInfo',{
        artist:artistName,
        handlers:{
            success:function(apiResp){
                var data=JSON.parse(apiResp);
                if(data && data.artist && data.artist.bio){
                    bio=data.artist.bio;
                }
                nbs.findArtistProfileByName(artistName,function(err,data){
                    res.contentType('application/json');
                    bio.profile=data;
                    res.send(bio);
                });
            },
            error:function(error) {
                res.contentType('application/json');
                res.send(bio);
            }
        }
    });
});

app.get('/artist/:artistName/album/:albumTitle/image',function(req,res){
    var image='css/images/no_picture.png';
    util.log('Getting image for='+req.params.albumTitle);
    lastfm.request('album.getInfo',{
        artist:req.params.artistName,
        album:req.params.albumTitle,
        handlers:{
            success:function(apiResp) {
                var data=JSON.parse(apiResp);
                if(data && data.album && data.album.image[2]){
                    image=data.album.image[2]['#text']||'css/images/no_picture.png';
                }
                res.send(image);
            },
            error:function(error) {
                res.send(image);
            }
        }
    });
});
app.get('/artist/:artistName/album/:albumTitle/poster',function(req,res){
    var image='css/images/no_picture.png';
    util.log('Getting image for='+req.params.albumTitle);
    lastfm.request('album.getInfo',{
        artist:req.params.artistName,
        album:req.params.albumTitle,
        handlers:{
            success:function(apiResp) {
                var data=JSON.parse(apiResp);
                if(data && data.album && data.album.image[4]){
                    image=data.album.image[4]['#text']||'css/images/no_picture.png';
                }
                res.send(image);
            },
            error:function(error) {
                res.send(image);
            }
        }
    });
});
app.get('/artist/:artistName/album/:albumTitle/info',function(req,res){
    util.log('Getting image for='+req.params.albumTitle);
    var artist=req.params.artistName,
        album=req.params.albumTitle,
        request=lastfm.request('album.getInfo', {
        artist:artist,
        album:album,
        handlers:{
            success:function(apiResp) {
                var data=JSON.parse(apiResp).album;
                if(!data){
                    var image='css/images/no_picture.png',
                        albumName=album,
                        releaseDate='no information',
                        songsCount='no information';
                    res.contentType('application/json');
                    res.send({image:image,name:albumName,releaseDate:releaseDate,songsCount:songsCount});
                }
                else{
                    var image='css/images/no_picture.png',
                        albumName=album,
                        releaseDate=data.releasedate.trim().split(',')[0]||'',//getting just date without time
                        songsCount=data.tracks.length||'';
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
            error:function(error) {
                var image='css/images/no_picture.png',
                    albumName=album,
                    releaseDate='',
                    songsCount='';
                res.contentType('application/json');
                res.send({image:image,name:albumName,releaseDate:releaseDate,songsCount:songsCount});
            }
        }
    });
});
function scrobble(trackName,artist,trackLength,key,user){
     var session=lastfm.session(user,key),
         startedTime=Math.round(((new Date().getTime()) /1000)-parseInt(trackLength,10)),
         LastFmUpdate=lastfm.update('scrobble',session,{
            track:{
                name:trackName,
                artist:{'#text':artist}
            },
            timestamp:startedTime
         });
     util.log('Started time for scrobbling is '+startedTime);
     LastFmUpdate.on('success',function(track){
        util.log('succesfull scrobble');
        util.log(util.inspect(track));
     });
     LastFmUpdate.on('error',function(track,error){
        util.log(track);
        util.log(error);
        util.log('unsuccesfull scrobble='+error);
     });
};
exports.app = app;