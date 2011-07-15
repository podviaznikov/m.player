$(function(){
"use strict";
    ui.PlayerCtrl=Backbone.View.extend({
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
        timeCounterEl:$('#time_counter'),
        //Last.fm integration                 \
        lastFmLoginBtn:$('#lastfm_login_btn'),
        lastFmUsername:$('#lastfm_username'),
        lastFmControlPanel:$('#lastfm_control_panel'),
        //facebook integration
        fbLoginBtn:$('#fb_login_btn'),
        fbLogoutBtn:$('#fb_logout_btn'),
        fbUsername:$('#fb_username'),
        fbControlPanel:$('#fb_control_panel'),
        //sound cloud integration
        scLoginBtn:$('#sc_login_btn'),
        scLogoutBtn:$('#sc_logout_btn'),
        scUsername:$('#sc_username'),
        scControlPanel:$('#sc_control_panel'),
        events:{
            'click #play_toggle':'togglePause',
            'click #stop_song':'stop',
            'click #previous_song':'previous',
            'click #next_song':'next',
            'click #sound_toggle':'toggleSound',
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
            'click #fb_logout_btn':'fbLogout',
            'click #sc_logout_btn':'scLogout'
        },
        initialize:function(){
            _.bindAll(this,'updateAudioProgress','songFinished','togglePause','changedVolume','turnOnFullScreen','turnOffFullScreen',
                    'turnOnHelpMode','turnOffHelpMode','changedMusicProgress','showSocialPanel','hideSocialPanel',
                    'lastFmLogin','lastFmExit','fbLogin','fbLogout','scLogin','scLogout');
            this.audioEl=AudioEl.newAudio('player_ctrl',{
                volume:AppController.settings.getVolume()
            });
            this.audioEl.on('updated',this.updateAudioProgress);
            this.audioEl.on('finished',this.songFinished);
            //setting volume to UI control
            this.volumeSlider.attr('value',AppController.settings.getVolume());
        },
        scLogin:function(name){
            this.scLoginBtn.hide();
            this.scControlPanel.removeClass('unlogined');
            this.scControlPanel.addClass('logined');
            this.scUsername.html(name);
        },
        scLogout:function(){
            this.scLoginBtn.show();
            this.scControlPanel.removeClass('logined');
            this.scControlPanel.addClass('unlogined');
            this.scUsername.html('');
            AppController.settings.saveScAccessToken('');
            AppController.settings.saveScUser('');
        },
        fbLogin:function(name){
            this.fbLoginBtn.hide();
            this.fbControlPanel.removeClass('unlogined');
            this.fbControlPanel.addClass('logined');
            this.fbUsername.html(name);
        },
        fbLogout:function(){
            this.fbLoginBtn.show();
            this.fbControlPanel.removeClass('logined');
            this.fbControlPanel.addClass('unlogined');
            this.fbUsername.html('');
            AppController.settings.saveFbAccessToken('');
            AppController.settings.saveFbUser('');
        },
        lastFmLogin:function(){
            this.lastFmLoginBtn.hide();
            this.lastFmControlPanel.removeClass('unlogined');
            this.lastFmControlPanel.addClass('logined');
            this.lastFmUsername.html(AppController.settings.getLastFmUser());
        },
        lastFmExit:function(){
            AppController.settings.saveLastFmUser('');
            AppController.settings.saveLastFmSessionKey('');
            this.lastFmControlPanel.removeClass('logined');
            this.lastFmControlPanel.addClass('unlogined');
            this.lastFmLoginBtn.show();
            this.lastFmUsername.html('');
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
                this.musicSlider.attr('value',newProgressValue);
                this.audioEl.time=newProgressValue;
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
            this.audioEl.volume=percent;
            this.volumeSlider.attr('value',percent);
            AppController.settings.saveVolume(percent);
        },
        toggleSound:function(){
            if(this.audioEl.isVolumeOn()){
                this.soundToggle.attr('title','Unmute');
                this.soundToggle.addClass('off');
                this.soundToggle.removeClass('on');
                this.soundOffIcon.show();
                this.soundOnIcon.hide();
            }
            else{
                this.soundToggle.attr('title','Mute');
                this.soundToggle.addClass('on');
                this.soundToggle.removeClass('off');
                this.soundOnIcon.show();
                this.soundOffIcon.hide();
            }
            this.audioEl.toggleVolume();
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
        togglePause:function(){
            if(this.audioEl.isPaused()){
                this.play();
            }
            else{
                this.playToggle.attr('title','Play');
                this.playToggle.addClass('paused');
                this.playToggle.removeClass('playing');
                this.audioEl.pause();
            }
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
            this.$(this.timeCounterEl).text(this.audioEl.timeCounter);
            this.musicSlider.attr('value',currentTime);

            if (!this.loadedMusicSlider){
                this.loadedMusicSlider=true;
                this.musicSlider.attr('max',duration);
            }
        },
        songFinished:function(){
            var currentSong=AppController.playlistView.currentSong(),
                timeInSeconds=parseInt(this.audioEl.time,10);
            if(currentSong){
                this.loadedMusicSlider=false;
                dataService.scrobble(currentSong.get('title'),currentSong.get('artist'),timeInSeconds);
                this.next();
            }
        }
    });
});