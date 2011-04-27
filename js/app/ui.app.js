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
        events:
        {
            'keyup':'keyPressed'
        },

        render:function()
        {
            return this;
        },
        showHelp:function()
        {
            this.el.removeClass('fullscreen');
            $('section.info_panel').addClass('hidden scrollable_content');
            $('section.help_panel').removeClass('hidden');
        },
        hideHelp:function()
        {
            $('section.info_panel.scrollable_content').removeClass('hidden');
            $('section.help_panel').addClass('hidden');
        },
        enterNowPlayingMode:function()
        {
            $('section.info_panel').addClass('hidden');
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
        }
    });

});
