/*global Porridge: true, UUID: true, fs:true,_:true,Backbone:true, async:true,dataService:true,fbService:true,ID3:true,FileAPIReader:true */
"use strict";
var ui={};
var AppController={
	init:function(){
        var newHeight=$(window).height()-105,
            playingSongPanel=$('#playing_songs');
        $('.scrollable_panel').height(newHeight);
        //always check url (hash) of the loaded page (maybe auth token are present)
        AppController.handleAuthentication();
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
            //init soundcloud
            AppController.soundcloudConnect();
            //init facebook
            AppController.facebookConnect();
            //init last.fm
            AppController.lastfmConnect();
            //second column
            AppController.detailsView=new ui.DetailsView();
        });
	},
	handleAuthentication:function(){
	    var accessToken=_.firstHashValue();
        if(accessToken){
            console.log('Auth token:',accessToken);
            //facebook authentication
            dataService.getFbUser(accessToken,function(userData){
                if(userData.name){
                    AppController.settings.saveFbAccessToken(accessToken);
                    AppController.settings.saveFbUser(userData.name);
                    AppController.playerCtrl.fbLogin(userData.name);
                }
            });
            //soundcloud authentication
            dataService.getScUser(accessToken,function(userData){
                var scUsername=userData.full_name||userData.username;
                if(scUsername){
                    AppController.settings.saveScAccessToken(accessToken);
                    AppController.settings.saveScUser(scUsername);
                    AppController.playerCtrl.scLogin(scUsername);
                    AppController.libraryMenu.showSoundCloudMenu();
                }
            });
            AppController.libraryMenu.soundCloudTracks.url=AppController.libraryMenu.soundCloudTracks.url+'?access_token='+accessToken;
            AppController.libraryMenu.soundCloudTracks.fetch();
        }
	},
	facebookConnect:function(){
	    if(AppController.settings.isFbLogined()){
	        AppController.playerCtrl.fbLogin(AppController.settings.getFbUser());
	    }
	},
	soundcloudConnect:function(){
	    if(AppController.settings.isScLogined()){
	        AppController.playerCtrl.scLogin(AppController.settings.getScUser());
	        AppController.libraryMenu.showSoundCloudMenu();
	        AppController.libraryMenu.soundCloudTracks.url=AppController.libraryMenu.soundCloudTracks.url+'?access_token='+AppController.settings.getScAccessToken();
	        AppController.libraryMenu.soundCloudTracks.fetch();
	    }
	},
	lastfmConnect:function(){
	    if(!AppController.settings.isLastFmLogined()){
            dataService.getSession(function(data){
                console.log('Last.fm session data',data);
                AppController.settings.saveLastFmUser(data.user);
                AppController.settings.saveLastFmSessionKey(data.key);
                if(AppController.settings.isLastFmLogined()){
                    AppController.playerCtrl.lastFmLogin();
                }
                else{
                    AppController.playerCtrl.lastFmExit();
                }
            });
        }
        else{
            AppController.playerCtrl.lastFmLogin();
        }
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
        },
        saveFbAccessToken:function(accessToken){
            localStorage.setItem('fb_access_token',accessToken);
        },
        getFbAccessToken:function(accessToken){
            return localStorage.getItem('fb_access_token')||'';
        },
        saveFbUser:function(fbUser){
            localStorage.setItem('fb_user_name',fbUser);
        },
        getFbUser:function(accessToken){
            return localStorage.getItem('fb_user_name')||'';
        },
        isFbLogined:function(){
            return this.getFbUser()!==''&& this.getFbAccessToken()!=='';
        },
        //SoundCloud integration
        saveScAccessToken:function(accessToken){
            localStorage.setItem('sc_access_token',accessToken);
        },
        getScAccessToken:function(accessToken){
            return localStorage.getItem('sc_access_token')||'';
        },
        saveScUser:function(scUser){
            localStorage.setItem('sc_user_name',scUser);
        },
        getScUser:function(accessToken){
            return localStorage.getItem('sc_user_name')||'';
        },
        isScLogined:function(){
            return this.getScUser()!==''&& this.getScAccessToken()!=='';
        },
    },
    metadataParser:{
        parse:function(name,binaryData,callback){
            var startDate=new Date().getTime();
            ID3.loadTags(name, function(){
                var endDate = new Date().getTime();
                console.log('Time: ' + ((endDate-startDate)/1000)+'s');
                var tags = ID3.getAllTags(name);
                callback(tags);
            },{tags: ["artist", "title", "album", "year", "comment", "track", "genre", "lyrics"],
            dataReader: new FileAPIReader(binaryData)});
        }
    }
};
//extending libs
_.mixin({
    contains:function(str1,str2){
        return str1.toUpperCase().indexOf(str2.toUpperCase())!==-1;
    },
    firstHashValue:function(){
        return window.location.hash.substring(1).split('&')[0].split('=')[1];
    }
});