/*global Porridge: true, UUID: true, fs:true,_:true,Backbone:true, async:true,dataService:true,fbService:true,ID3:true,FileAPIReader:true */
"use strict";
var ui={};
var AppController={
	init:function(){
        var newHeight=$(window).height()-105,
            playingSongPanel=$('#playing_songs');
        $('.scrollable_panel').height(newHeight);
        $(window).bind('hashchange', function() {
            var accessToken = window.location.hash.substring(1);
            if(accessToken){
                console.log('FB access token:',accessToken);
                dataService.getFbUser(accessToken);
            }
        });
        //fixing height for songs panel
        playingSongPanel.height('initial');
        playingSongPanel.css('max-height',newHeight-184);
		this.appView=new ui.AppView();
		this.playerCtrl=new ui.PlayerCtrl();
		this.visualizationView=new ui.VisualizationView();
        this.visualizationView.el.height(newHeight);
        var config={
            dbName:'mdb',
            dbDescription:'m.player database',
            dbVersion:'1',
            stores:[Song.definition,Artist.definition,PlayList.definition]
        };
        Porridge.init(config,function(){
            //third column
            AppController.playlistView=new ui.PlayListView();
            //first column
            AppController.libraryMenu=new ui.LibraryMenu();
            //second column
            AppController.detailsView=new ui.DetailsView();
            //getting session info if user not logined to last.fm
//            if(!AppController.settings.isLastFmLogined()){
//                dataService.getSession(function(data){
//                    console.log('Last.fm session data',data);
//                    AppController.settings.saveLastFmUser(data.user);
//                    AppController.settings.saveLastFmSessionKey(data.key);
//                    if(AppController.settings.isLastFmLogined()){
//                        AppController.playerCtrl.lastFmLogin();
//                    }
//                    else{
//                        AppController.playerCtrl.lastFmExit();
//                    }
//                });
//            }
//            else{
//                AppController.playerCtrl.lastFmLogin();
//            }
            var accessToken = window.location.hash.substring(1);
            if(accessToken){
                console.log('FB access token',accessToken);
                dataService.getFbUser(accessToken);
            }
//            dataService.initFB(function(data){
//                console.log('FB session data',data);
//                AppController.playerCtrl.fbUpdateButtons(data.fbLoginURL,data.fbLogoutURL);
//                if(data.fbUser){
//                    AppController.playerCtrl.fbLogin(data.fbUser);
//                }
//                else{
//                   AppController.playerCtrl.fbLogout();
//                }
//           });
        });
	},
    //storing all users' settings(locally): volume, last music, pressed buttons etc.
    settings:{
        saveShuffle:function(isShuffle){
            localStorage.setItem('isShuffle',isShuffle);
        },
        isShuffle:function(){
            var value=localStorage.getItem('isShuffle');
            return value?JSON.parse(value):false;
        },
        saveRepeat:function(isRepeat){
            localStorage.setItem('isRepeat',isRepeat);
        },
        isRepeat:function(){
            var value=localStorage.getItem('isRepeat');
            return value?JSON.parse(value):false;
        },
        saveLastSong:function(song){
            localStorage.setItem('lastSong',JSON.stringify(song));
        },
        getLastSong:function(){
            return JSON.parse(localStorage.getItem('lastSong'));
        },
        saveVolume:function(volume){
            localStorage.setItem('playerVolume',volume);
        },
        getVolume:function(){
            return localStorage.getItem('playerVolume')||0.5;
        },
        savePlayList:function(songs){
            localStorage.setItem('playlist',JSON.stringify(songs));
        },
        getPlayList:function(){
            var models=JSON.parse(localStorage.getItem('playlist'));
            return new SongsList(models);
        },
        saveLastArtist:function(artist){
            localStorage.setItem('lastArtist',artist);
        },
        getLastArtist:function(){
            return localStorage.getItem('lastArtist');
        },
        saveLastAlbum:function(album){
            localStorage.setItem('lastAlbum',album);
        },
        getLastAlbum:function(){
            return localStorage.getItem('lastAlbum');
        },
        saveLastFmUser:function(user){
            localStorage.setItem('user',user);
        },
        getLastFmUser:function(){
            return localStorage.getItem('user')||'';
        },
        saveLastFmSessionKey:function(sessionKey){
            localStorage.setItem('sessionKey',sessionKey);
        },
        getLastFmSessionKey:function(){
            return localStorage.getItem('sessionKey')||'';
        },
        isLastFmLogined:function(){
            return this.getLastFmUser()!==''&& this.getLastFmSessionKey()!=='';
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
