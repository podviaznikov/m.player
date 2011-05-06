// m.player
// (c) 2011 Enginimation Studio (http://enginimation.com).
// m.player may be freely distributed under the MIT license.
// For all details and documentation:
// https://github.com/podviaznikov/m.player
"use strict";
var ui={};
$(function()
{
    ui.AppView = Backbone.View.extend(
    {
        el: $('body'),
        infoPanels:$('section.info_panel'),
        helpPanels:$('section.help_panel'),
        mainPanels:$('section.main_panel'),
        isRegularMode:true,
        events:
        {
            'keyup':'keyPressed'
        },
        showHelp:function()
        {
            this.isRegularMode=false;
            this.el.removeClass('fullscreen');
            this.infoPanels.addClass('hidden');
            this.helpPanels.removeClass('hidden');
        },
        hideHelp:function()
        {
            this.isRegularMode=true;
            this.infoPanels.removeClass('hidden');
            this.helpPanels.addClass('hidden');
        },
        showFullScreen:function()
        {
            this.infoPanels.addClass('hidden');
            this.el.addClass('fullscreen');
            AppController.visualizationView.show();
        },
        hideFullScreen:function()
        {
            this.el.removeClass('fullscreen');
            if(this.isRegularMode)
            {
                this.mainPanels.removeClass('hidden');
            }
            else
            {
                this.helpPanels.removeClass('hidden');
            }
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
                AppController.playerCtrl.turnOffFullScreen();
                AppController.playerCtrl.turnOffHelpMode();
            }
        }
    });

});
