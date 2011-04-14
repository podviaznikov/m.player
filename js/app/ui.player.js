// m.Player
// (c) 2011 Anton Podviaznikov, Enginimation Studio (http://enginimation.info).
// m.player may be freely distributed under the MIT license.
// For all details and documentation:
// https://github.com/podviaznikov/m.player
"use strict";
var global = window;
$(function()
{
    ui.AudioElement = Backbone.View.extend({
        id: 'player_ctrl',
        tagName: 'audio',
        events:
        {
           'timeupdate':'handlePlaying',
           'pause': 'pause'
        },
        handlePlaying: function()
        {
           this.options.player.trigger('audio:update',this.el.duration,this.el.currentTime);
        },
        play:function(url)
        {
            if(url)
            {
                this.el.setAttribute('src',url);
            }
            this.el.play();
        },
        pause:function()
        {
            this.el.pause();
        },
        stop:function()
        {
            this.pause();
            this.el.currentTime=0;
        },
        setVolume:function(volume)
        {
            this.el.volume=volume;
        },
        getVolume:function()
        {
            return this.el.volume;
        },
        getDuration:function()
        {
            return this.el.duration;
        },
        setTime:function(time)
        {
            this.el.currentTime=time;
            this.options.player.trigger('audio:update',this.el.duration,time);
        }

    });
    ui.PlayerCtrl = Backbone.View.extend({
        el:$('#player'),
        playToggle:$('#play_toggle'),
        soundToggle:$('#sound_toggle'),
        shuffleToggle:$('#shuffle_toggle'),
        repeatToggle:$('#repeat_toggle'),
        handleMusicProgress:$('#music_gutter #music_handle'),
        handleVolume:$('#volume_gutter #volume_handle'),
        loadedMusicSlider:false,
        manualSeekMusicSlider:false,

        events:
        {
            'click #play_toggle.paused': 'resume',
            'click #play_toggle.playing': 'pause',
            'click #stop_song': 'stop',
            'click #previous_song': 'previous',
            'click #next_song': 'next',
            'click #sound_toggle.off': 'soundOn',
            'click #sound_toggle.on': 'soundOff',
            'click #shuffle_toggle.on':'shuffleOff',
            'click #shuffle_toggle.off':'shuffleOn',
            'click #repeat_toggle.on':'repeatOff',
            'click #repeat_toggle.off':'repeatOn',
            'click #expand.on':'nowPlayingMode',
            'click #expand.off':'regularPlayerMode'
        },
        initialize:function()
        {
            this.bind('audio:update',this.updateAudioProgress);
            _.bindAll(this,'togglePause','changedVolume','nowPlayingMode','regularPlayerMode');
            this.audioEL = new ui.AudioElement({player:this});
            var self = this;
            $('#volume_gutter').slider(
            {
                value:settings.getVolume(),
                step: 0.01,
                range: 'min',
                max: 1,
                animate: true,
                stop:this.changedVolume
            });
        },
        nowPlayingMode:function()
        {
            $('#expand').removeClass('on');
            $('#expand').addClass('off');
            AppController.appView.enterNowPlayingMode();
        },
        regularPlayerMode:function()
        {
            $('#expand').removeClass('off');
            $('#expand').addClass('on');
            AppController.appView.enterRegularPlayerMode();
        },
        changedVolume:function(e,ui)
        {
            this.audioEL.setVolume(ui.value);
            settings.saveVolume(ui.value);
        },
        soundOn:function()
        {
            this.soundToggle.attr('title','Mute');

            this.soundToggle.addClass('on');
            this.soundToggle.removeClass('off');
            this.$('#sound_on_icon').show();
            this.$('#sound_off_icon').hide();

            this.audioEL.setVolume(this.volume||0.5);
        },
        soundOff:function()
        {
            this.soundToggle.attr('title','Sound');

            this.soundToggle.addClass('off');
            this.soundToggle.removeClass('on');
            this.$('#sound_off_icon').show();
            this.$('#sound_on_icon').hide();

            this.volume=this.audioEL.getVolume();
            this.audioEL.setVolume(0);
        },
        shuffleOn:function()
        {
            this.shuffleToggle.attr('title','Turn shuffle off');
            this.shuffleToggle.addClass('on');
            this.shuffleToggle.removeClass('off');
            settings.saveShuffle(true);
        },
        shuffleOff:function()
        {
            this.shuffleToggle.attr('title','Turn shuffle on');
            this.shuffleToggle.addClass('off');
            this.shuffleToggle.removeClass('on');
            settings.saveShuffle(false);
        },
        repeatOn:function()
        {
            this.repeatToggle.attr('title','Turn repeat off');
            this.repeatToggle.addClass('on');
            this.repeatToggle.removeClass('off');
            settings.saveRepeat(true);
        },
        repeatOff:function()
        {
            this.repeatToggle.attr('title','Turn repeat on');
            this.repeatToggle.addClass('off');
            this.repeatToggle.removeClass('on');
            settings.saveRepeat(false);
        },
        play:function(url)
        {
            this.playToggle.attr('title','Pause');
            this.playToggle.addClass('playing');
            this.playToggle.removeClass('paused');
            this.audioEL.play(url);
        },
        resume:function()
        {
            this.play();
        },
        pause:function()
        {
            this.$(this.playToggle).attr('title','Play');
            this.$(this.playToggle).addClass('paused');
            this.$(this.playToggle).removeClass('playing');
            this.audioEL.pause();
        },
        togglePause:function()
        {
            var isPaused = this.$(this.playToggle).hasClass('paused');
            if(isPaused)
            {
                this.play();
            }
            else
            {
                this.pause();
            }
        },
        stop:function()
        {
            this.playToggle.addClass('paused');
            this.playToggle.removeClass('playing');
            this.audioEL.stop();
        },
        previous:function()
        {
            AppController.playlistView.previous();
        },
        next:function()
        {
            AppController.playlistView.next();
        },
        updateAudioProgress: function(duration,currentTime)
        {
            var self = this,
                timeInSeconds = parseInt(currentTime, 10),
                rem = parseInt(duration - currentTime, 10),
                pos = (timeInSeconds / duration) * 100,
                mins = Math.floor(currentTime/60,10),
                secs = timeInSeconds - mins*60,
                timeCounter = mins + ':' + (secs > 9 ? secs : '0' + secs);
            if(rem==0)
            {
                this.next();
            }
            this.$('#time_counter').text(timeCounter);
            if (!this.manualSeekMusicSlider)
            {
                var posPer=pos + '%';
                this.handleMusicProgress.css('left',posPer);
                this.$('#music_gutter .ui-slider-range').width(posPer);
            }
            if (!this.loadedMusicSlider)
            {
                this.loadedMusicSlider = true;

                $('#music_gutter').slider(
                {
                    value:0,
                    step: 0.01,
                    range: "min",
                    max: duration,
                    animate: true,
                    start: function()
                    {
                        self.manualSeekMusicSlider = true;
                    },
                    stop:function(e,ui)
                    {
                        self.manualSeekMusicSlider = false;
                        self.audioEL.setTime(ui.value);
                    }
                });
            }
        }
    });
});
