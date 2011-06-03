// m.player
// (c) 2011 Enginimation Studio (http://enginimation.com).
// m.player may be freely distributed under the MIT license.
// For all details and documentation:
// https://github.com/podviaznikov/m.player.
"use strict";
var dataService ={
    scrobble:function(track,artist,trackLength)
    {
        $.post('/song_played/'+artist+'/'+track+'/'+trackLength);
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
    }
};
