// m.Player
// (c) 2011 Anton Podviaznikov, Enginimation Studio (http://enginimation.info).
// m.player may be freely distributed under the MIT license.
// For all details and documentation:
// https://github.com/podviaznikov/m.player
"use strict";
var ui={};
var global = window;
$(function()
{
    ui.AppView = Backbone.View.extend(
    {
        el: $('body'),
        infoPanels:$('section.info_panel'),
        helpPanels:$('section.help_panel'),
        events:
        {
            'keyup':'keyPressed'
        },
        showHelp:function()
        {
            this.el.removeClass('fullscreen');
            this.infoPanels.addClass('hidden scrollable_content');
            this.helpPanels.removeClass('hidden');
        },
        hideHelp:function()
        {
            $('section.info_panel.scrollable_content').removeClass('hidden');
            this.helpPanels.addClass('hidden');
        },
        enterNowPlayingMode:function()
        {
            this.infoPanels.addClass('hidden');
            this.el.addClass('fullscreen');
            AppController.visualizationView.show();
        },
        enterRegularPlayerMode:function()
        {
            this.el.removeClass('fullscreen');
            $('section.info_panel.scrollable_content').removeClass('hidden');
            AppController.visualizationView.hide();
        },
        keyPressed:function(event)
        {
            var keyCode = event.keyCode;
            if(keyCode==40)//down arrow
            {
                AppController.playlistView.next(false);
            }
            else if(keyCode==38)//up key
            {
                AppController.playlistView.previous(false);
            }
            else if(keyCode==13)//enter
            {
                AppController.playlistView.destroyFileURL();
                AppController.playlistView.currentSong().view.playSong();
            }
            else if(keyCode==32)//space
            {
                AppController.playerCtrl.togglePause();
            }
            else if(keyCode==46)//delete
            {
                //delete song from playlist
                AppController.playlistView.currentSong().view.remove();
            }
            else if(keyCode==27)//escape
            {
                //comeback to the normal view
                AppController.playerCtrl.regularPlayerMode();
                AppController.playerCtrl.turnOffHelpMode();
            }
        }
    });

});
