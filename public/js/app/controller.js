// m.player
// (c) 2011 Enginimation Studio (http://enginimation.com).
// m.player may be freely distributed under the MIT license.
// For all details and documentation:
// https://github.com/podviaznikov/m.player
"use strict";
var global=window;
var AppController=
{
	init:function()
	{
//	    var queryParams=window.location.search;
//	    if(queryParams && queryParams!='')
//	    {
//	        var token=queryParams.split('=')[1];
//	        getSession(token);
//	    }
        var newHeight = $(window).height()-105;
        $('.scrollable_panel').height(newHeight);

		this.appView = new ui.AppView;
		this.playerCtrl=new ui.PlayerCtrl;
		this.visualizationView = new ui.VisualizationView;
        this.visualizationView.el.height(newHeight);
        var config=
        {
            dbName:'mdb',
            dbDescription:'m.player database',
            dbVersion:'1',
            stores:[Song.definition,Artist.definition,PlayList.definition]
        };
        Porridge.init(config,function()
        {
            AppController.playlistView = new ui.PlayListView;
            AppController.libraryMenu = new ui.LibraryMenu;
            AppController.songsView = new ui.SongsView;
        });

        //doesn't work now. track http://code.google.com/p/chromium/issues/detail?id=7469
        //$(document.body).bind("online", this.checkNetworkStatus);
        //$(document.body).bind("offline", this.checkNetworkStatus);
        //this.checkNetworkStatus();
	}

};

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

