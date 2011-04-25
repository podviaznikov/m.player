// m.Player
// (c) 2011 Anton Podviaznikov, Enginimation Studio (http://enginimation.info).
// m.player may be freely distributed under the MIT license.
// For all details and documentation:
// https://github.com/podviaznikov/m.player.
"use strict";
var apiUrl='http://ws.audioscrobbler.com/2.0/?';
var apiKey='e3377f4b4d8c6de47c7e2c81485a65f5';

var lastFM=
{
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
