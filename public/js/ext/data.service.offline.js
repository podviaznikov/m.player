// m.player
// (c) 2011 Enginimation Studio (http://enginimation.com).
// m.player may be freely distributed under the MIT license.
// For all details and documentation:
// https://github.com/podviaznikov/m.player.
"use strict";
var dataService=
{
    getSession:function(callback)
    {
        callback({user:'',key:''});
    },
    scrobble:function(track,artist,trackLength)
    {
        //do nothing
    },
    getArtistImage:function(artist,callback)
    {
        callback('css/images/no_picture.png');
    },
    getAlbumImage:function(artist,album,callback)
    {
        callback('css/images/no_picture.png');
    },
    getAlbumPoster:function(artist,album,callback)
    {
        callback('css/images/no_picture.png');
    },
    getAlbumInfo:function(artist,album,callback)
    {
        var image='css/images/no_picture.png',
            albumName=album,
            releaseDate='no information',
            songsCount='no information';
        callback({image:image,name:albumName,releaseDate:releaseDate,songsCount:songsCount});
    },
    getArtistBio:function(artist,callback)
    {
        callback({});
    }
};
