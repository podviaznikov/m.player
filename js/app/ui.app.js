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
        enterNowPlayingMode:function()
        {
          $('section.info_panel').hide();
        },

        enterRegularPlayerMode:function()
        {
          $('section.info_panel').css('display','inline-block');
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
