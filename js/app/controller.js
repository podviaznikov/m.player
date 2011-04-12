// m.Player
// (c) 2011 Anton Podviaznikov, Enginimation Studio (http://enginimation.info).
// m.player may be freely distributed under the MIT license.
// For all details and documentation:
// https://github.com/podviaznikov/m.player
"use strict";
var AppController=
{
	init:function()
	{
	    _.bindAll(this,'onDBLoad');
        var newHeight = $(window).height()-75;
        $('body .scrollable_content').height(newHeight);

		this.appView = new ui.AppView;
		this.playerCtrl=new ui.PlayerCtrl;
		this.albumInfoView = new ui.AlbumInfoView;
		this.visualizationView = new ui.VisualizationView;
		musicDao.open(this.onDBLoad);
	},
    /**
     * Load UI components that are depended on connection to the storage(indexDB).
     */
	onDBLoad:function()
	{
        this.libraryMenu = new ui.LibraryMenu;
        this.songsView = new ui.SongsView;
        this.playlistView = new ui.PlayListView;
	}
};
