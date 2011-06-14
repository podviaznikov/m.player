"use strict";
$(function(){
    ui.PlayerCtrl = Backbone.View.extend({
        el:$('#player'),
        mainControls:$('#main_controls_panel'),
        socialControls:$('#social_controls_panel'),
        playToggle:$('#play_toggle'),
        soundToggle:$('#sound_toggle'),
        shuffleToggle:$('#shuffle_toggle'),
        repeatToggle:$('#repeat_toggle'),
        playerModeToggle:$('#expand'),
        helpModeToggle:$('#help'),
        socialModeToggle:$('#social'),
        loadedMusicSlider:false,
        volumeSlider:$('#volume_slider'),
        musicSlider:$('#music_slider'),
        soundOffIcon:$('#sound_off_icon'),
        soundOnIcon:$('#sound_on_icon'),
        timeCounter:$('#time_counter'),
        lastFmLoginBtn:$('#lastfm_login_btn'),
        lastFmUsername:$('#lastfm_username'),
        lastFmControlPanel:$('#lastfm_control_panel'),
        fbLoginBtn:$('#fb_login_btn'),
        fbControlPanel:$('#fb_control_panel'),
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
            'click #help.off':'turnOnHelpMode',
            'click #social.on':'hideSocialPanel',
            'click #social.off':'showSocialPanel',
            'click #volume_slider':'changedVolume',
            'click #music_slider':'changedMusicProgress',
            'click #lastfm_logout_btn':'lastFmExit',
            'click #fb_login_btn':'fbLogin',
            'click #fb_logout_btn':'fbLogout'
        },
        initialize:function(){
            this.bind('audio:update',this.updateAudioProgress);
            _.bindAll(this,'togglePause','changedVolume','turnOnFullScreen','turnOffFullScreen',
                    'turnOnHelpMode','turnOffHelpMode','changedMusicProgress','showSocialPanel','hideSocialPanel',
                    'lastFmLogin','lastFmExit','fbLogin','fbLogout');
            this.audioEl=new ui.AudioElement({player:this});
            //setting volume to audio element
            this.audioEl.setVolume(AppController.settings.getVolume());
            //setting volume to UI control
            this.volumeSlider.attr('value',AppController.settings.getVolume());
        },
        fbLogin:function(){
            fbService.login();
            this.fbLoginBtn.hide();
            this.fbControlPanel.removeClass('unlogined');
            this.fbControlPanel.addClass('logined');
        },
        fbLogout:function(){
            fbService.logout();
            this.fbLoginBtn.show();
            this.fbControlPanel.removeClass('logined');
            this.fbControlPanel.addClass('unlogined');
        },
        lastFmLogin:function(){
            this.lastFmLoginBtn.hide();
            this.lastFmControlPanel.removeClass('unlogined');
            this.lastFmControlPanel.addClass('logined');
            this.$(this.lastFmUsername).html(AppController.settings.getLastFmUser());
        },
        lastFmExit:function(){
            AppController.settings.saveLastFmUser('');
            AppController.settings.saveLastFmSessionKey('');
            this.lastFmControlPanel.removeClass('logined');
            this.lastFmControlPanel.addClass('unlogined');
            this.lastFmLoginBtn.show();
            this.$(this.lastFmUsername).html('');
        },
        showSocialPanel:function(){
            this.$(this.el).addClass('socialized');
            this.socialModeToggle.removeClass('off');
            this.socialModeToggle.addClass('on');
            this.$(this.mainControls).addClass('hidden');
            this.$(this.socialControls).removeClass('hidden');
        },
        hideSocialPanel:function(){
            this.$(this.el).removeClass('socialized');
            this.socialModeToggle.removeClass('on');
            this.socialModeToggle.addClass('off');
            this.$(this.socialControls).addClass('hidden');
            this.$(this.mainControls).removeClass('hidden');
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
        changedMusicProgress:function(e){
            if(this.loadedMusicSlider){
                var newX=e.offsetX,
                    width=this.musicSlider.width(),
                    max=parseFloat(this.musicSlider.attr('max')),
                    newProgressValue=(newX/width*max);
                console.log(newX,width,max);
                this.musicSlider.attr('value',newProgressValue);
                this.audioEl.setTime(newProgressValue);
            }
        },
        changedVolume:function(e){
            var newX=e.offsetX,
                width=this.volumeSlider.width(),
                percent=newX/width;
            //minor hack for possibility to make 100% loud
            if(percent>0.95){
                percent=1;
            }
            this.audioEl.setVolume(percent);
            this.volumeSlider.attr('value',percent);
            AppController.settings.saveVolume(percent);
        },
        soundOn:function(){
            this.soundToggle.attr('title','Mute');

            this.soundToggle.addClass('on');
            this.soundToggle.removeClass('off');
            this.soundOnIcon.show();
            this.soundOffIcon.hide();

            this.audioEl.setVolume(this.volume||0.5);
        },
        soundOff:function(){
            this.soundToggle.attr('title','Sound');

            this.soundToggle.addClass('off');
            this.soundToggle.removeClass('on');
            this.soundOffIcon.show();
            this.soundOnIcon.hide();

            this.volume=this.audioEl.getVolume();
            this.audioEl.setVolume(0);
        },
        shuffleOn:function(){
            this.shuffleToggle.attr('title','Turn shuffle off');
            this.shuffleToggle.addClass('on');
            this.shuffleToggle.removeClass('off');
            AppController.settings.saveShuffle(true);
        },
        shuffleOff:function(){
            this.shuffleToggle.attr('title','Turn shuffle on');
            this.shuffleToggle.addClass('off');
            this.shuffleToggle.removeClass('on');
            AppController.settings.saveShuffle(false);
        },
        repeatOn:function(){
            this.repeatToggle.attr('title','Turn repeat off');
            this.repeatToggle.addClass('on');
            this.repeatToggle.removeClass('off');
            AppController.settings.saveRepeat(true);
        },
        repeatOff:function(){
            this.repeatToggle.attr('title','Turn repeat on');
            this.repeatToggle.addClass('off');
            this.repeatToggle.removeClass('on');
            AppController.settings.saveRepeat(false);
        },
        play:function(url){
            this.loadedMusicSlider=false;
            this.playToggle.attr('title','Pause');
            this.playToggle.addClass('playing');
            this.playToggle.removeClass('paused');
            this.audioEl.play(url);
        },
        resume:function(){
            this.play();
        },
        pause:function(){
            this.$(this.playToggle).attr('title','Play');
            this.$(this.playToggle).addClass('paused');
            this.$(this.playToggle).removeClass('playing');
            this.audioEl.pause();
        },
        togglePause:function(){
            var isPaused=this.$(this.playToggle).hasClass('paused');
            isPaused?this.play():this.pause();
        },
        stop:function(){
            this.playToggle.addClass('paused');
            this.playToggle.removeClass('playing');
            this.audioEl.stop();
            this.loadedMusicSlider=false;
        },
        previous:function(){
            AppController.playlistView.previous();
        },
        next:function(){
            AppController.playlistView.next();
        },
        updateAudioProgress:function(duration,currentTime){
            var timeInSeconds=parseInt(currentTime,10),
                songDuration=parseInt(duration,10),
                rem=parseInt(duration - currentTime,10),
                pos=(timeInSeconds / duration) * 100,
                mins=Math.floor(currentTime/60,10),
                secs=timeInSeconds - mins*60,
                timeCounter= mins + ':' + (secs > 9 ? secs : '0' + secs),
                currentSong=AppController.playlistView.currentSong();
            if(rem===0 && currentSong){
                this.loadedMusicSlider=false;
                dataService.scrobble(currentSong.get('title'),currentSong.get('artist'),timeInSeconds);
                this.next();
            }
            this.timeCounter.text(timeCounter);
            this.musicSlider.attr('value',currentTime);

            if (!this.loadedMusicSlider){
                this.loadedMusicSlider=true;
                this.musicSlider.attr('max',duration);
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