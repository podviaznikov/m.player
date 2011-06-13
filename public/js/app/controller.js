/*global Porridge: true, UUID: true, fs:true,_:true,Backbone:true, async:true,dataService:true,fbService:true,ID3:true,FileAPIReader:true */
"use strict";
var global=window,
    ui={};
var AppController={
	init:function(){
        var newHeight=$(window).height()-105,
            playingSongPanel=$('#playing_songs');
        $('.scrollable_panel').height(newHeight);
        //fixing height for songs panel
        playingSongPanel.height('initial');
        playingSongPanel.css('max-height',newHeight-184);
		this.appView=new ui.AppView();
		this.playerCtrl=new ui.PlayerCtrl();
		this.visualizationView=new ui.VisualizationView();
        this.visualizationView.el.height(newHeight);
        this.artistBioView=new ui.ArtistBioView();
        this.artistBioView.el.height(newHeight);
        var config={
            dbName:'mdb',
            dbDescription:'m.player database',
            dbVersion:'1',
            stores:[Song.definition,Artist.definition,PlayList.definition]
        };
        Porridge.init(config,function(){
            AppController.playlistView=new ui.PlayListView();
            AppController.libraryMenu=new ui.LibraryMenu();
            AppController.songsView=new ui.SongsView();
            //getting session info if user not logined
            if(!AppController.settings.isLogined()){
                dataService.getSession(function(data){
                    console.log(data);
                    AppController.settings.saveUser(data.user);
                    AppController.settings.saveSessionKey(data.key);
                    console.log(AppController.settings.isLogined());
                    if(AppController.settings.isLogined()){
                        AppController.playerCtrl.lastFmOff();
                    }
                    else{
                        AppController.playerCtrl.lastFmOn();
                    }
                });
            }
        });
        //fbService.init();
        //doesn't work now. track http://code.google.com/p/chromium/issues/detail?id=7469
        //$(document.body).bind("online", this.checkNetworkStatus);
        //$(document.body).bind("offline", this.checkNetworkStatus);
        //this.checkNetworkStatus();
	},
    //storing all users' settings(locally): volume, last music, pressed buttons etc.
    settings:{
        saveShuffle:function(isShuffle){
            global.localStorage.setItem('isShuffle',isShuffle);
        },
        isShuffle:function(){
            var value=global.localStorage.getItem('isShuffle');
            return value?JSON.parse(value):false;
        },
        saveRepeat:function(isRepeat){
            global.localStorage.setItem('isRepeat',isRepeat);
        },
        isRepeat:function(){
            var value=global.localStorage.getItem('isRepeat');
            return value?JSON.parse(value):false;
        },
        saveLastSong:function(song){
            global.localStorage.setItem('lastSong',JSON.stringify(song));
        },
        getLastSong:function(){
            return JSON.parse(global.localStorage.getItem('lastSong'));
        },
        saveVolume:function(volume){
            global.localStorage.setItem('playerVolume',volume);
        },
        getVolume:function(){
            return global.localStorage.getItem('playerVolume')||0.5;
        },
        savePlayList:function(songs){
            global.localStorage.setItem('playlist',JSON.stringify(songs));
        },
        getPlayList:function(){
            var models=JSON.parse(global.localStorage.getItem('playlist'));
            return new SongsList(models);
        },
        saveLastArtist:function(artist){
            global.localStorage.setItem('lastArtist',artist);
        },
        getLastArtist:function(){
            return global.localStorage.getItem('lastArtist');
        },
        saveLastAlbum:function(album){
            global.localStorage.setItem('lastAlbum',album);
        },
        getLastAlbum:function(){
            return global.localStorage.getItem('lastAlbum');
        },
        saveUser:function(user){
            global.localStorage.setItem('user',user);
        },
        getUser:function(){
            return global.localStorage.getItem('user')||'';
        },
        saveSessionKey:function(sessionKey){
            global.localStorage.setItem('sessionKey',sessionKey);
        },
        getSessionKey:function(){
            return global.localStorage.getItem('sessionKey')||'';
        },
        isLogined:function(){
            return this.getUser()!==''&& this.getSessionKey()!=='';
        }
    },
    metadataParser:{
        parse:function(name,binaryData,callback){
            var startDate=new Date().getTime();
            ID3.loadTags(name, function(){
                var endDate = new Date().getTime();
                console.log('Time: ' + ((endDate-startDate)/1000)+'s');
                var tags = ID3.getAllTags(name);
                callback(tags);
            },{tags: ["artist", "title", "album", "year", "comment", "track", "genre", "lyrics", "picture"],
            dataReader: new FileAPIReader(binaryData)});
        }
    }
};
