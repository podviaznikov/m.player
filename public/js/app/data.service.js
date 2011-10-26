// m.player
// (c) 2011 Enginimation Studio (http://enginimation.com).
// m.player may be freely distributed under the MIT license.
// For all details and documentation:
// https://github.com/podviaznikov/m.player.
"use strict";
var dataService={
    getSession:function(callback){
        if(navigator.onLine){
            $.getJSON('/session_data',callback);
        }
        else{
            callback({});
        }
    },
    getFbUser:function(authToken,callback){
        if(navigator.onLine){
            $.getJSON('/fb/user?access_token='+authToken,callback);
        }
        else{
            callback({});
        }
    },
    getScUser:function(authToken,callback){
        if(navigator.onLine){
            $.getJSON('/sc/user?access_token='+authToken,callback);
        }
        else{
            callback({});
        }
    },
    scrobble:function(track,artist,trackLength){
        if(navigator.onLine){
            artist=escape(artist);
            track=escape(track);
            $.post('/song_played?user='+AppController.settings.getLastFmUser()
                +'&key='+AppController.settings.getLastFmSessionKey()
                +'&access_token='+AppController.settings.getFbAccessToken()
                +'&artist='+artist
                +'&track='+track
                +'&length='+trackLength);
        }
    },
    getArtistImage:function(artist,callback){
        if(navigator.onLine){
            artist=escape(artist);
            var jqxhr=$.get('/artist/'+artist+'/image',callback)
            .error(function(){ callback('css/images/no_picture.png'); });
        }
        else{
            callback('css/images/no_picture.png');
        }
    },
    getAlbumImage:function(artist,album,callback){
        if(navigator.onLine){
            artist=escape(artist);
            album=escape(album);
            var jqxhr=$.get('/artist/'+artist+'/album/'+album+'/image',callback)
            .error(function(){ callback('css/images/no_picture.png'); });
        }
        else{
            callback('css/images/no_picture.png');
        }
    },
    getAlbumPoster:function(artist,album,callback){
        if(navigator.onLine){
            artist=escape(artist);
            album=escape(album);
            var jqxhr=$.get('/artist/'+artist+'/album/'+album+'/poster',callback)
            .error(function(){ callback('css/images/no_picture.png'); });
        }
        else{
            callback('css/images/no_picture.png');
        }
    },
    getAlbumInfo:function(artist,album,callback){
        var image='css/images/no_picture.png',
            albumName=album,
            releaseDate='',
            songsCount='';
        if(navigator.onLine){
            artist=escape(artist);
            album=escape(album);
            var jqxhr=$.get('/artist/'+artist+'/album/'+album+'/info',callback)
            .error(function(){
                callback({image:image,name:albumName,releaseDate:releaseDate,songsCount:songsCount});
            });
        }
        else{
            callback({image:image,name:albumName,releaseDate:releaseDate,songsCount:songsCount});
        }
    },
    getArtistBio:function(artist,callback){
        if(navigator.onLine){
            artist=escape(artist);
            var jqxhr=$.getJSON('/artist/'+artist+'/bio',callback)
            .error(function(){
                callback({});
            });
        }
        else{
            callback({});
        }
    }
};

exports.dataService = dataService;

