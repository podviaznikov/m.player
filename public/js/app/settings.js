// m.Player
// (c) 2011 Anton Podviaznikov, Enginimation Studio (http://enginimation.info).
// m.player may be freely distributed under the MIT license.
// For all details and documentation:
// https://github.com/podviaznikov/m.player
"use strict";
var global=window;
var settings=
{
    saveShuffle:function(isShuffle)
    {
        global.localStorage.setItem('isShuffle',isShuffle);
    },
    isShuffle:function()
    {
        var value = global.localStorage.getItem('isShuffle');
        return value?JSON.parse(value):false;
    },
    saveRepeat:function(isRepeat)
    {
        global.localStorage.setItem('isRepeat',isRepeat);
    },
    isRepeat:function()
    {
        var value = global.localStorage.getItem('isRepeat');
        return value?JSON.parse(value):false;
    },
    saveLastSong:function(song)
    {
        global.localStorage.setItem('lastSong',JSON.stringify(song));
    },
    getLastSong:function()
    {
        return JSON.parse(global.localStorage.getItem('lastSong'));
    },
    saveVolume:function(volume)
    {
        global.localStorage.setItem('playerVolume',volume);
    },
    getVolume:function()
    {
        return global.localStorage.getItem('playerVolume')||0.5;
    },
    savePlayList:function(songs)
    {
        global.localStorage.setItem('playlist',JSON.stringify(songs));
    },
    getPlayList:function()
    {
        var models = JSON.parse(global.localStorage.getItem('playlist'));
        return new SongsList(models);
    },
    saveLastArtist:function(artist)
    {
        global.localStorage.setItem('lastArtist',artist);
    },
    getLastArtist:function()
    {
        return global.localStorage.getItem('lastArtist');
    },
    saveLastAlbum:function(album)
    {
        global.localStorage.setItem('lastAlbum',album);
    },
    getLastAlbum:function()
    {
        return global.localStorage.getItem('lastAlbum');
    }

};
