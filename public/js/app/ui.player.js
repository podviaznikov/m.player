"use strict";
var global = window;
$(function(){
    ui.PlayerCtrl = Backbone.View.extend({
        el:$('#player'),
        playToggle:$('#play_toggle'),
        soundToggle:$('#sound_toggle'),
        shuffleToggle:$('#shuffle_toggle'),
        repeatToggle:$('#repeat_toggle'),
        handleMusicProgress:$('#music_gutter #music_handle'),
        handleVolume:$('#volume_gutter #volume_handle'),
        playerModeToggle:$('#expand'),
        helpModeToggle:$('#help'),
        loadedMusicSlider:false,
        manualSeekMusicSlider:false,
        volumeGutter:$('#volume_gutter'),
        soundOffIcon:$('#sound_off_icon'),
        soundOnIcon:$('#sound_on_icon'),
        timeCounter:$('#time_counter'),
        events:{
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
            'click #expand.on':'turnOnFullScreen',
            'click #expand.off':'turnOffFullScreen',
            'click #help.on':'turnOffHelpMode',
            'click #help.off':'turnOnHelpMode'
        },
        initialize:function(){
            this.bind('audio:update',this.updateAudioProgress);
            _.bindAll(this,'togglePause','changedVolume','turnOnFullScreen','turnOffFullScreen',
                    'turnOnHelpMode','turnOffHelpMode');
            this.audioEL = new ui.AudioElement({player:this});
            this.volumeGutter.slider({
                value:settings.getVolume(),
                step:0.01,
                range:'min',
                max:1,
                animate:true,
                stop:this.changedVolume
            });
        },
        turnOnHelpMode:function(){
            this.helpModeToggle.removeClass('off');
            this.helpModeToggle.addClass('on');
            AppController.appView.showHelp();
        },
        turnOffHelpMode:function(){
            this.helpModeToggle.removeClass('on');
            this.helpModeToggle.addClass('off');
            AppController.appView.hideHelp();
        },
        turnOnFullScreen:function(){
            this.playerModeToggle.removeClass('on');
            this.playerModeToggle.addClass('off');
            this.playerModeToggle.attr('title','Library mode');
            AppController.appView.showFullScreen();
        },
        turnOffFullScreen:function(){
            this.playerModeToggle.removeClass('off');
            this.playerModeToggle.addClass('on');
            this.playerModeToggle.attr('title','Full screen mode');
            AppController.appView.hideFullScreen();
        },
        changedVolume:function(e,ui){
            this.audioEL.setVolume(ui.value);
            settings.saveVolume(ui.value);
        },
        soundOn:function(){
            this.soundToggle.attr('title','Mute');

            this.soundToggle.addClass('on');
            this.soundToggle.removeClass('off');
            this.soundOnIcon.show();
            this.soundOffIcon.hide();

            this.audioEL.setVolume(this.volume||0.5);
        },
        soundOff:function(){
            this.soundToggle.attr('title','Sound');

            this.soundToggle.addClass('off');
            this.soundToggle.removeClass('on');
            this.soundOffIcon.show();
            this.soundOnIcon.hide();

            this.volume=this.audioEL.getVolume();
            this.audioEL.setVolume(0);
        },
        shuffleOn:function(){
            this.shuffleToggle.attr('title','Turn shuffle off');
            this.shuffleToggle.addClass('on');
            this.shuffleToggle.removeClass('off');
            settings.saveShuffle(true);
        },
        shuffleOff:function(){
            this.shuffleToggle.attr('title','Turn shuffle on');
            this.shuffleToggle.addClass('off');
            this.shuffleToggle.removeClass('on');
            settings.saveShuffle(false);
        },
        repeatOn:function(){
            this.repeatToggle.attr('title','Turn repeat off');
            this.repeatToggle.addClass('on');
            this.repeatToggle.removeClass('off');
            settings.saveRepeat(true);
        },
        repeatOff:function(){
            this.repeatToggle.attr('title','Turn repeat on');
            this.repeatToggle.addClass('off');
            this.repeatToggle.removeClass('on');
            settings.saveRepeat(false);
        },
        play:function(url){
            this.playToggle.attr('title','Pause');
            this.playToggle.addClass('playing');
            this.playToggle.removeClass('paused');
            this.audioEL.play(url);
        },
        resume:function(){
            this.play();
        },
        pause:function(){
            this.$(this.playToggle).attr('title','Play');
            this.$(this.playToggle).addClass('paused');
            this.$(this.playToggle).removeClass('playing');
            this.audioEL.pause();
        },
        togglePause:function(){
            var isPaused = this.$(this.playToggle).hasClass('paused');
            isPaused?this.play():this.pause();
        },
        stop:function(){
            this.playToggle.addClass('paused');
            this.playToggle.removeClass('playing');
            this.audioEL.stop();
        },
        previous:function(){
            AppController.playlistView.previous();
        },
        next:function(){
            AppController.playlistView.next();
        },
        updateAudioProgress:function(duration,currentTime){
            var self = this,
                timeInSeconds = parseInt(currentTime, 10),
                songDuration = parseInt(duration,10),
                rem = parseInt(duration - currentTime, 10),
                pos = (timeInSeconds / duration) * 100,
                mins = Math.floor(currentTime/60,10),
                secs = timeInSeconds - mins*60,
                timeCounter = mins + ':' + (secs > 9 ? secs : '0' + secs),
                currentSong = AppController.playlistView.currentSong();
            if(rem==0){
                lastFM.scrobble(currentSong.get('title'),currentSong.get('artist'),timeInSeconds);
                this.next();
            }
            this.timeCounter.text(timeCounter);
            if (!this.manualSeekMusicSlider){
                var posPer=pos + '%';
                this.handleMusicProgress.css('left',posPer);
                this.$('#music_gutter .ui-slider-range').width(posPer);
            }
            if (!this.loadedMusicSlider){
                this.loadedMusicSlider = true;

                $('#music_gutter').slider({
                    value:0,
                    step: 0.01,
                    range: "min",
                    max: duration,
                    animate: true,
                    start:function(){
                        self.manualSeekMusicSlider = true;
                    },
                    stop:function(e,ui){
                        self.manualSeekMusicSlider = false;
                        self.audioEL.setTime(ui.value);
                    }
                });
            }
        }
    });
    ui.AudioElement = Backbone.View.extend({
        id:'player_ctrl',
        tagName:'audio',
        events:{
           'timeupdate':'handlePlaying',
           'pause': 'pause'
        },
        handlePlaying:function(){
           this.options.player.trigger('audio:update',this.el.duration,this.el.currentTime);
        },
        play:function(url){
            if(url){
                this.el.setAttribute('src',url);
            }
            this.el.play();
        },
        pause:function(){
            this.el.pause();
        },
        stop:function(){
            this.pause();
            this.el.currentTime=0;
        },
        setVolume:function(volume){
            this.el.volume=volume;
        },
        getVolume:function(){
            return this.el.volume;
        },
        getDuration:function(){
            return this.el.duration;
        },
        setTime:function(time){
            this.el.currentTime=time;
            this.options.player.trigger('audio:update',this.el.duration,time);
        }
    });
});
