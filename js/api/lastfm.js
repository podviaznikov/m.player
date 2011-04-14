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
        var reqUrl=apiUrl+'method=artist.getInfo&artist='+artist+'&format=json&api_key='+apiKey;
        $.ajax(
        {
            url: reqUrl,
            context: document.body,
            crossDomain:true,
            dataType:'jsonp',
            success: function(data)
            {
                callback(data.artist.image[2]['#text']||'css/images/no_picture.png');
            },
            error: function()
            {
                callback('css/images/no_picture.png');
            }
        });
    },

    getAlbumImage:function(artist,album,callback)
    {
        var reqUrl=apiUrl+'method=album.getInfo&artist='+artist+'&album='+album+'&format=json&api_key='+apiKey;
        $.ajax(
        {
            url: reqUrl,
            context: document.body,
            crossDomain:true,
            dataType:'jsonp',
            success: function(data)
            {
                callback(data.album.image[2]['#text']||'css/images/no_picture.png');
            },
            error: function()
            {
                callback('css/images/no_picture.png');
            }
        });
    },

    getAlbumPoster:function(artist,album,callback)
    {
        var reqUrl=apiUrl+'method=album.getInfo&artist='+artist+'&album='+album+'&format=json&api_key='+apiKey;
        $.ajax(
        {
            url: reqUrl,
            context: document.body,
            crossDomain:true,
            dataType:'jsonp',
            success: function(data)
            {
                callback(data.album.image[4]['#text']||'css/images/no_picture.png');
            },
            error: function()
            {
                callback('css/images/no_picture.png');
            }
        });
    },

    getAlbumInfo:function(artist,album,callback)
    {
        var reqUrl=apiUrl+'method=album.getInfo&artist='+artist+'&album='+album+'&format=json&api_key='+apiKey;
        $.ajax(
        {
            url: reqUrl,
            context: document.body,
            crossDomain:true,
            dataType:'jsonp',
            success: function(data)
            {
                data = data.album;
                var image = data.image[2]['#text']||'css/images/no_picture.png';//medium
                var albumName = data.name.trim()||album;
                var releaseDate = data.releasedate.trim().split(',')[0]||'na';//getting just date without time
                var songsCount = data.tracks.length||'na';

                callback({image:image,name:albumName,releaseDate:releaseDate,songsCount:songsCount});
            },
            error: function()
            {
                var image='css/images/no_picture.png';
                var albumName=album;
                var releaseDate='na';
                var songsCount='na';

                callback({image:image,name:albumName,releaseDate:releaseDate,songsCount:songsCount});
            }
        });
    }
};
