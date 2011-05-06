// m.player
// (c) 2011 Enginimation Studio (http://enginimation.com).
// m.player may be freely distributed under the MIT license.
// For all details and documentation:
// https://github.com/podviaznikov/m.player
"use strict";
var AppController=
{
	init:function()
	{
        var newHeight = $(window).height()-105;
        $('.scrollable_panel').height(newHeight);

		this.appView = new ui.AppView;
		this.playerCtrl=new ui.PlayerCtrl;
		this.visualizationView = new ui.VisualizationView;
        this.visualizationView.el.height(newHeight);
        var config=
        {
            dbName:'mdb_v8',
            dbDescription:'m.player database',
            dbVersion:'1',
            stores:[Song.definition,Artist.definition,PlayList.definition]
        };
        Porridge.init(config,function()
        {
            AppController.playlistView = new ui.PlayListView;
            AppController.libraryMenu = new ui.LibraryMenu;
            AppController.songsView = new ui.SongsView;
        })//this.onDBLoad);

        //doesn't work now. track http://code.google.com/p/chromium/issues/detail?id=7469
        //$(document.body).bind("online", this.checkNetworkStatus);
        //$(document.body).bind("offline", this.checkNetworkStatus);
        //this.checkNetworkStatus();
	},
    /**
     * Load UI components that are depended on connection to the storage(indexDB).
     */
	onDBLoad:function()
	{
        this.playlistView = new ui.PlayListView;
        this.libraryMenu = new ui.LibraryMenu;
        this.songsView = new ui.SongsView;
	}
//    checkNetworkStatus:function()
//    {
//        if (navigator.onLine) {
//            alert('Online');
//        }
//        else {
//            alert('Offline');
//        }
//    }
};
