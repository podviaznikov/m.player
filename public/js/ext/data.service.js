// m.player
// (c) 2011 Enginimation Studio (http://enginimation.com).
// m.player may be freely distributed under the MIT license.
// For all details and documentation:
// https://github.com/podviaznikov/m.player.
"use strict";
var dataService={
    getSession:function(callback){
        $.getJSON('/session_data',callback);
    },
    initFB:function(callback){
        $.getJSON('/fb_data',callback);
    },
    getFbUser:function(authToken,callback){
        $.get('/fb_user?access_token='+authToken,function(data){
            console.log(data);
            callback(data);
        });
    },
    scrobble:function(track,artist,trackLength){
        $.post('/song_played/'+artist+'/'+track+'/'+trackLength+'?user='+AppController.settings.getLastFmUser()
        +'&key='+AppController.settings.getLastFmSessionKey()+'&access_token='AppController.settings.getFbAccessToken());
    },
    getArtistImage:function(artist,callback){
        var jqxhr = $.get('/artist/'+artist+'/image',function(data){
            callback(data);
        })
        .error(function() { callback('css/images/no_picture.png'); })
    },
    getAlbumImage:function(artist,album,callback){
        var jqxhr = $.get('/artist/'+artist+'/album/'+album+'/image',function(data){
            callback(data);
        })
        .error(function() { callback('css/images/no_picture.png'); })
    },
    getAlbumPoster:function(artist,album,callback){
        var jqxhr = $.get('/artist/'+artist+'/album/'+album+'/poster',function(data){
            callback(data);
        })
        .error(function() { callback('css/images/no_picture.png'); })
    },
    getAlbumInfo:function(artist,album,callback){
        var jqxhr = $.get('/artist/'+artist+'/album/'+album+'/info',function(data){
            callback(data);
        })
        .error(function() {
            var image='css/images/no_picture.png',
                albumName=album,
                releaseDate='no information',
                songsCount='no information';

            callback({image:image,name:albumName,releaseDate:releaseDate,songsCount:songsCount});
        });
    },
    getArtistBio:function(artist,callback)
    {
        var jqxhr = $.getJSON('/artist/'+artist+'/bio',function(data){
            callback(data);
        })
        .error(function() {
            callback({});
        });
    }
};
