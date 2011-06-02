// m.player
// (c) 2011 Enginimation Studio (http://enginimation.com).
// m.player may be freely distributed under the MIT license.
// For all details and documentation:
// https://github.com/podviaznikov/m.player.
"use strict";
var lastFM=
{
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
        var image='css/images/no_picture.png';
        var albumName=album;
        var releaseDate='na';
        var songsCount='na';
        callback({image:image,name:albumName,releaseDate:releaseDate,songsCount:songsCount});
    }
};
