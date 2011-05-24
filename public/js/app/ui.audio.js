// m.player
// (c) 2011 Enginimation Studio (http://enginimation.com).
// m.player may be freely distributed under the MIT license.
// For all details and documentation:
// https://github.com/podviaznikov/m.player
"use strict";
$(function(){
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
