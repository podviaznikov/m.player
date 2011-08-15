/**(c) 2011 Enginimation Studio (http://enginimation.com). May be freely distributed under the MIT license.*/
/*global Porridge: true, UUID: true, fs:true,_:true,Backbone:true, async:true,dataService:true,fbService:true,ID3:true,FileAPIReader:true */
"use strict";
var ui={};
var AppController={
	init:function(){
        var newHeight=$(window).height()-105,
            playingSongPanel=$('#playing_songs');
        $('.scrollable_panel').height(newHeight);
        $(window).bind('hashchange',function(){
            console.log('Hashchange fired!');
            AppController.handleAuthentication();
        });
        //handle auth token in URL
        AppController.handleAuthentication();
        //fixing height for songs panel
        playingSongPanel.height('initial');
        playingSongPanel.css('max-height',newHeight-184);
		this.appView=new ui.AppView();
		this.playerCtrl=new ui.PlayerCtrl();
		this.visualizationView=new ui.VisualizationView();
        this.visualizationView.el.height(newHeight);
        var dbVersion='1';
        var config={
            dbName:'mdb',
            dbDescription:'m.player database',
            dbVersion:'1',
            stores:[Song.definition,Artist.definition,PlayList.definition]
        };
        Porridge.init(config,function(){
            if(dbVersion!==AppController.settings.getDbVersion()){
                fs.io.readFilesFromRootDirectory(function(err,files){
                    if(!err){
                        console.log("Files",files);
                        AppController.appView.handleFileSelect(files,false);
                    }
                });
                AppController.settings.saveDbVersion(dbVersion);
            }
            console.log('Initialized views and social services');
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
            if(_.secondHashKey()==='scope'){
                //soundcloud authentication
                dataService.getScUser(accessToken,function(userData){
                    var scUsername=userData.full_name||userData.username;
                    if(scUsername){
                        AppController.settings.saveScAccessToken(accessToken);
                        AppController.settings.saveScUser(scUsername);
                        AppController.playerCtrl.scLogin(scUsername);
                        AppController.libraryMenu.showSoundCloudMenu();
                        AppController.libraryMenu.soundCloudTracks.fetch();
                    }
                });
            }
            else{
                //facebook authentication
                dataService.getFbUser(accessToken,function(userData){
                    if(userData.name){
                        AppController.settings.saveFbAccessToken(accessToken);
                        AppController.settings.saveFbUser(userData.name);
                        AppController.playerCtrl.fbLogin(userData.name);
                    }
                });
            }
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
        saveDbVersion:function(dbVersion){
            localStorage.setItem('dbVersion',dbVersion);
        },
        getDbVersion:function(){
            return localStorage.getItem('dbVersion');
        },
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
            return this.getLastFmUser()!=='' && this.getLastFmSessionKey()!=='';
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
            return this.getFbUser()!=='' && this.getFbAccessToken()!=='';
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
            return this.getScUser()!=='' && this.getScAccessToken()!=='';
        },
    },
    metadataParser:{
        parse:function(name,binaryData,callback){
            var startDate=new Date().getTime();
            ID3.loadTags(name,function(){
                console.log('Time: ' + ((new Date().getTime()-startDate)/1000)+'s');
                var parsedTags=ID3.getAllTags(name),
                    tags={},
                    originalTrack=parsedTags.track;
                //fix track number
                if(originalTrack && _.isString(originalTrack)){
                    var slashIndex=originalTrack.indexOf('/');
                    if(slashIndex>0){
                        tags.track=originalTrack.substring(0,slashIndex);
                    }
                    //don't save that 0 in the track number
                    if('0'===originalTrack.charAt(0)){
                        tags.track=originalTrack.substring(1);
                    }
                }
                if(parsedTags.artist){
                    tags.artist=parsedTags.artist.trim();
                }
                if(parsedTags.title){
                    tags.title=parsedTags.title.trim();
                }
                if(parsedTags.album){
                    tags.album=parsedTags.album.trim();
                }
                if(parsedTags.year){
                    tags.year=parsedTags.year.trim();
                }
                if(parsedTags.genre){
                    tags.genre=parsedTags.genre.trim();
                }
                callback(tags);
            },{tags:['artist','title','album','year','track','genre'],
            dataReader:new FileAPIReader(binaryData)});
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
    },
    secondHashKey:function(){
        return window.location.hash.substring(1).split('&')[1].split('=')[0];
    }
});
/**(c) 2011 Enginimation Studio (http://enginimation.com). May be freely distributed under the MIT license.*/
/*global Backbone: true,$:true */
Backbone.View.prototype.hide=function(){
    this.$(this.el).hide();
    return this;
};
Backbone.View.prototype.show=function(){
    this.$(this.el).show();
    return this;
};
Backbone.View.prototype.html=function(html){
    this.$(this.el).html(html);
    return this;
};
Backbone.View.prototype.initialize=function(){
    _.bindAll(this,'render','renderTpl');
    if(this.tplId){
        this.tpl=$('#'+this.tplId).html();
    }
};
Backbone.View.prototype.tplId='';
Backbone.View.prototype.render=function(){
    this.renderTpl();
    return this;
};
Backbone.View.prototype.renderTpl=function(model){
    var modelToRender=model || this.model.toJSON();
    if(this.tpl && modelToRender){
        var html=_.template(this.tpl,modelToRender);
        this.html(html);
    }
    return this;
};
var DataTransfer={
    create:function(type,value){
        return Object.create(this,{type:{value:type},value:{value:value}});
    },
    toString:function(){
        return JSON.stringify({
            type:this.type,
            value:this.value
        });
    },
    fromString:function(source){
        return JSON.parse(source);
    }
};
var Song=Porridge.Model.extend({
    defaults:{
        album:'No information',
        title:'No information',
        artist:'No information',
        year:'',
        genre:''
    },
    remove:function(){
        //destroy model
        this.destroy();
        //remove file from filesystem
        fs.util.remove(this.get('fileName'));
    },
    findImage:function(callback){
        var self=this;
        dataService.getAlbumImage(this.get('artist'),this.get('album'),function(image){
            self.set({image:image});
            callback();
        });
    }
},{
    definition:{
        name:'song',
        key:'id',
        indexes:[{name:'artists',field:'artist'}]
    }
});
var SongsList=Porridge.Collection.extend({
    model:Song,
    //sort by track number or name if track number is not presented
    comparator:function(song){
        var track=song.get('track');
        if(track && track!==''){
            //should always pass 10. In other case '08'(as example) may be parsed incorrectly
            return parseInt(track,10);
        }
        return song.get('name');
    },
    buildAlbumModel:function(album,artist){
        return new Album({name:album,artist:artist,songs:this.forAlbum(album)});
    },
    forAlbum:function(album){
        return this.filter(function(song){return song.get('album')===album;});
    },
    listOfAlbums:function(){
        return _.uniq(this.pluck('album'))||[];
    },
    listOfGenres:function(){
        return _.uniq(this.pluck('genre'))||[];
    },
    listOfAlbumsModels:function(){
        var albums=new AlbumList();
        if(this.length>0){
            var artist=this.first().get('artist'),
                albumsArray=this.listOfAlbums(),
                self=this;
            _.each(albumsArray,function(album){
                var songs=self.forAlbum(album);
                albums.add(new Album({name:album,artist:artist,songs:new SongsList(songs)}));
            });
        }
        return albums;
    },
    remove:function(){
        this.each(function(song){
            song.remove();
        });
    }
});
var Artist=Porridge.Model.extend({
    defaults:{
        isDeleted:false,
        songsCount:0,
        albums:[],
        genres:[]
    },
    initialize:function(){
        _.bindAll(this,'setParameterFromSongs','remove');
        if(!this.get('id')){
            this.id=UUID.generate();
            this.set({id:this.id});
        }
        this.songs=new SongsList();
        this.albumsModels=new AlbumList();
        this.songs.bind('retrieved',this.setParameterFromSongs);
        this.songs.fetchByKey('artists',this.get('name'));
    },
    setParameterFromSongs:function(){
        var albums=this.songs.listOfAlbums(),
            genres=this.songs.listOfGenres(),
            songsCount=this.songs.length;
        this.set({albums:albums,genres:genres,songsCount:songsCount});
        if(songsCount===0){
            this.set({isDeleted:true});
        }
        //reset albums models
        this.albumsModels.reset(this.songs.listOfAlbumsModels().models);
    },
    remove:function(){
        this.set({isDeleted:true});
        this.songs.remove();
        this.model.save();
    },
    findImage:function(callback){
        var self=this;
        dataService.getArtistImage(this.get('name'),function(image){
            self.set({image:image});
            self.save();
            callback();
        });
    }
},{
    definition:{
        name:'artist',
        key:'name'
    }
});
var ArtistsList=Porridge.Collection.extend({
    model:Artist,
    forName:function(artistName){
        return this.find(function(artist){ return artist.get('name') === artistName; });
    },
    comparator:function(artist){return artist.get('name');}
});
//name and artist fields
var Album=Backbone.Model.extend({
    findImage:function(callback){
        var self=this;
        dataService.getAlbumImage(this.get('artist'),this.get('name'),function(image){
            self.set({image:image});
            callback();
        });
    }
});
var AlbumList=Backbone.Collection.extend({
    model:Album,
    isExist:function(album){
        var foundedAlbum=this.forModel(album);
        return foundedAlbum!==undefined;
    },
    //find album model from list that has the same name
    forModel:function(albumToFind){
        return this.find(function(album){ return album.get('name') === albumToFind.get('name')});
    },
    forName:function(albumName){
        return this.find(function(album){ return album.get('name') === albumName; });
    },
    comparator:function(album){return album.get('name');}
});
var PlayList=Porridge.Model.extend({
    defaults:{
        songs:[]
    },
    findSongs:function(){
        var songsArray=this.get('songs')||[];
        return new SongsList(songsArray);
    },
    findImage:function(callback){
        var songs=this.findSongs();
        if(songs.length>0){
            var firstSong=songs.first();
            dataService.getAlbumImage(firstSong.get('artist'),firstSong.get('album'),callback);
        }
        else{
            callback('css/images/no_picture.png');
        }
    },
    findGenres:function(){
        return this.findSongs().listOfGenres();
    }
},{
    definition:{
        name:'playlist',
        key:'id'
    }
});
var PlayLists=Porridge.Collection.extend({
    model:PlayList,
    forName:function(playlistName){
        return this.find(function(playlist){ return playlist.get('name') === playlistName; });
    },
    comparator:function(playlist){return playlist.get('name');}
});
var SoundCloudTrack=Backbone.Model.extend({});
var SoundCloudTrackList=Backbone.Collection.extend({
    model:SoundCloudTrack,
    url:function(){
        return '/sc/tracks?access_token='+AppController.settings.getScAccessToken();
    }
});
$(function(){
"use strict";
    ui.AppView=Backbone.View.extend({
        el: $('body'),
        progress:$('#uploading_files_progress progress'),
        helpScreen:$('#help_screen'),
        mainScreen:$('#main_screen'),
        isRegularMode:true,
        dropFolderCtrl:$('#drop_folder'),
        dropFilesCtrl:$('#drop_files'),
        fileUploadStatusDialog:$('#file_upload_status_dialog'),
        events:{
            'keyup':'keyPressed',
            'dragover':'dragOverFiles',
            'drop .main_panel':'dropFiles',
            'change #drop_files':'dropFiles',
            'change #drop_folder':'dropFiles',
            'click #import_songs_directory':'importMusicDirectory',
            'click #import_songs_files':'importMusicFiles',
        },
        initialize:function(){
            _.bindAll(this,'dragOverFiles','dropFiles','handleFileSelect','showHelp',
                    'hideHelp','showFullScreen','hideFullScreen','keyPressed',
                    'importMusicDirectory','importMusicFiles','processOneAudioFile');
        },
        importMusicDirectory:function(){
            this.dropFolderCtrl.click();
        },
        importMusicFiles:function(){
            this.dropFilesCtrl.click();
        },
        dragOverFiles:function(e){
            e.stopPropagation();
            e.preventDefault();
        },
        dropFiles:function(e){
            e.stopPropagation();
            e.preventDefault();
            //getting from file input or dragged content
            var target=e.originalEvent.dataTransfer||e.originalEvent.target,
                files=target.files;
            if(files && files.length>0){
               this.handleFileSelect(files); // handle FileList object.
            }
        },
        handleFileSelect:function(files,write){
            var self=this,
                write=write||true,
                fileProcessingFunctions=[];
            this.fileUploadStatusDialog.addClass('active');
            _.each(files,function(file,index){
                var bindedFunct=async.apply(self.processOneAudioFile,file,index,files.length,write);
                fileProcessingFunctions.push(bindedFunct);
            });
            async.series(fileProcessingFunctions,function(err,results){
                self.fileUploadStatusDialog.removeClass('active');
            });
        },
        //todo(anton) some refactoring should be done. get dom elements from here
        processOneAudioFile:function(file,index,filesAmount,write,callback){
            var percent=Math.floor(((index+1)/filesAmount)*100),
                progressElement=this.$(this.progress);
            this.$('#file_index').html(index);
            this.$('#total_files_amount').html(filesAmount);
            this.$('#uploading_files_progress header span').html(file.name);
            fs.read.fileAsBinaryString(file,function(readError,data,initialFile){
                if(readError){return;}
                AppController.metadataParser.parse(initialFile.name,data,function(tags){
                    console.log('Tags',tags);
                    var song=new Song();
                    tags.fileName=song.id+initialFile.extension();
                    tags.originalFileName=initialFile.name;
                    song.set(tags);
                    progressElement.val(percent);
                    if(write){
                        fs.write.file(initialFile,function(writeError){
                            if(!writeError){
                                AppController.appView.saveSong(song,callback);
                                AppController.playlistView.songs.add(song);
                            }
                        },song.get('fileName'));
                    }
                    else{
                        AppController.appView.saveSong(song,callback);
                    }
               });
            });
        },
        saveSong:function(song,callback){
            song.save();
            var artistName=song.get('artist'),
                artist=AppController.libraryMenu.artists.forName(artistName);
            if(!artist){
                artist=new Artist({name:artistName});
                artist.findImage(function(){
                    AppController.libraryMenu.artists.add(artist);
                    callback(null);
                });
            }
            else{
                //if artist was deleted: mark it as undeleted
                artist.set({isDeleted:false});
                var songsCount=artist.get('songsCount')||0;
                artist.set({songsCount:songsCount+1});
                artist.songs.add(song,{silent:true});
                artist.save();
                artist.change();
                callback(null);
            }
        },
        showHelp:function(){
            this.isRegularMode=false;
            this.el.removeClass('fullscreen');
            this.helpScreen.removeClass('hidden');
            this.mainScreen.addClass('hidden');
            AppController.visualizationView.hide();
        },
        hideHelp:function(){
            this.isRegularMode=true;
            this.mainScreen.removeClass('hidden');
            this.helpScreen.addClass('hidden');
        },
        showFullScreen:function(){
            this.hideHelp();
            this.mainScreen.addClass('hidden');
            this.el.addClass('fullscreen');
            AppController.visualizationView.show();
        },
        hideFullScreen:function(){
            this.el.removeClass('fullscreen');
            if(this.isRegularMode){
                this.mainScreen.removeClass('hidden');
            }
            else{
                this.helpScreen.removeClass('hidden');
            }
            AppController.visualizationView.hide();
        },
        keyPressed:function(event){
            var keyCode=event.keyCode,
                currentSong;
            if(AppController.playlistView){
                currentSong=AppController.playlistView.currentSong();
            }
            if(keyCode===40){
                //down arrow
                AppController.playlistView.next(false);
            }
            else if(keyCode===38){
                //up key
                AppController.playlistView.previous(false);
            }
            else if(keyCode===13){
                //enter
                if(currentSong){
                    currentSong.view.playSong();
                }
            }
            else if(keyCode===32){
                //space
                AppController.playerCtrl.togglePause();
            }
            else if(keyCode===46){
                //delete-delete song from playlist
               if(currentSong){
                    currentSong.view.remove();
                }
            }
            else if(keyCode===27){
                //escape-comeback to the normal view
                AppController.playerCtrl.turnOffFullScreen();
                AppController.playerCtrl.turnOffHelpMode();
            }
        }
    });

    ui.VisualizationView=Backbone.View.extend({
        el:$('#playing_visualization'),
        tplId:'visualization_tpl',
        show:function(){
            this.el.show();
            this.render();
        },
        hide:function(){
            this.el.hide();
        },
        render:function(){
            var self=this,
                song=AppController.playlistView.currentSong();
            if(song){
                dataService.getAlbumPoster(song.get('artist'),song.get('album'),function(image){
                    self.renderTpl({image:image});
                });
            }
            return this;
        }
    });

});
$(function(){
    "use strict";
    ui.LibraryMenu=Backbone.View.extend({
        el:$('#library_menu'),
        searchField:$('#library_menu header input'),
        artistsContent:$('#artists_library_content'),
        albumsContent:$('#albums_library_content'),
        playListsContent:$('#playlists_library_content'),
        soundCloudContent:$('#soundcloud_library_content'),
        events:{
            'click #show_artists':'showArtists',
            'click #show_playlists':'showPlayLists',
            'click #show_albums':'showAlbums',
            'click #show_soundcloud':'showSoundCloud',
            'blur input':'filterLibrary',
            'keyup input':'keyPressed'
        },
        initialize:function(){
            Backbone.View.prototype.initialize.apply(this,arguments);
            this.artists=new ArtistsList();//should be first in this method!
            this.playLists=new PlayLists();//should be first in this method!
            this.albums=new AlbumList();//should be first in this method!
            this.soundCloudTracks=new SoundCloudTrackList();//should be first in this method!
            this.tabName='artists';
            _.bindAll(this,'addArtist','addPlayList','addPlayLists','addAlbum','addSoundCloudTrack','addSoundCloudTracks',
                'showArtists','showPlayLists','showAlbums','showSoundCloud',
                'allArtistsLoaded','filterLibrary','keyPressed','showSoundCloudMenu');
            this.artists.bind('add',this.addArtist);
            this.artists.bind('retrieved',this.allArtistsLoaded);
            this.playLists.bind('add',this.addPlayList);
            this.playLists.bind('reset',this.addPlayLists);
            this.soundCloudTracks.bind('add',this.addSoundCloudTrack);
            this.soundCloudTracks.bind('reset',this.addSoundCloudTracks);
            this.artists.fetch();
            this.playLists.fetch();
            this.soundCloudTracks.fetch();
        },
        showSoundCloudMenu:function(){
            this.$('#show_soundcloud').removeClass('hidden');
        },
        keyPressed:function(event){
            var keyCode=event.keyCode;
            if(keyCode===13){
                this.filterLibrary();
            }
        },
        allArtistsLoaded:function(){
            var lastArtist=AppController.settings.getLastArtist();
            if(lastArtist){
                var lastPlayedArtist=this.artists.forName(lastArtist);
                if(lastPlayedArtist && lastPlayedArtist.view){
                    lastPlayedArtist.view.selectArtist();
                }
            }
        },
        showArtists:function(){
            this.tabName='artists';
            this.$(this.searchField).attr('placeholder','Search artist');
            this.artistsContent.show();
            this.albumsContent.hide();
            this.playListsContent.hide();
            this.soundCloudContent.hide();
        },
        showAlbums:function(){
            this.tabName='albums';
            this.$(this.searchField).attr('placeholder','Search album');
            this.albumsContent.show();
            this.artistsContent.hide();
            this.playListsContent.hide();
            this.soundCloudContent.hide();
        },
        showPlayLists:function(){
            this.tabName='playlists';
            this.$(this.searchField).attr('placeholder','Search play list');
            this.playListsContent.show();
            this.artistsContent.hide();
            this.albumsContent.hide();
            this.soundCloudContent.hide();
        },
        showSoundCloud:function(){
            this.tabName='soundcloud';
            this.$(this.searchField).attr('placeholder','Search tracks');
            this.soundCloudContent.show();
            this.playListsContent.hide();
            this.artistsContent.hide();
            this.albumsContent.hide();
        },
        addAlbum:function(album){
            if(!this.albums.isExist(album)){
                this.albums.add(album);
                var view=new ui.AlbumMenuView({model:album});
                this.albumsContent.append(view.render().el);
            }
            else{
                var albumFromList=this.albums.forModel(album);
                albumFromList.get('songs').add(album.get('songs').models);
                albumFromList.trigger('add');
            }
        },
        addArtist:function(artist){
            //do not show view if artist has no name
            var self=this;
            if(artist.get('name') && !artist.get('isDeleted')){
                artist.albumsModels.bind('reset',function(){
                    var albums=this;
                    albums.each(self.addAlbum);
                });
                var view=new ui.ArtistMenuView({model:artist});
                this.artistsContent.append(view.render().el);
            }
        },
        addPlayList:function(playList){
            var view=new ui.PlayListMenuView({model:playList});
            this.playListsContent.append(view.render().el);
        },
        addSoundCloudTrack:function(soundCloudTrack){
            var view=new ui.SoundCloudTrackMenuView({model:soundCloudTrack});
            this.soundCloudContent.append(view.render().el);
        },
        addSoundCloudTracks:function(){
            this.soundCloudTracks.each(this.addSoundCloudTrack);
        },
        addPlayLists:function(){
            this.playLists.each(this.addPlayList);
        },
        filterLibrary:function(){
            var filterValue=this.searchField.val(),
                containerItems=this.artists;
            if(this.tabName==='soundcloud'){
               containerItems=this.soundCloudTracks;
            }
            else if(this.tabName==='playlists'){
                containerItems=this.playLists;
            }
            else if(this.tabName==='albums'){
                containerItems=this.albums;
            }
            if(!filterValue || filterValue===''){
                containerItems.each(function(item){
                    if(item.view){
                        item.view.show();
                    }
                });
            }
            else{
                containerItems.each(function(item){
                    if(_.contains(item.get('name'),filterValue)){
                        if(item.view){
                            item.view.show();
                        }
                    }
                    else{
                        if(item.view){
                            item.view.hide();
                        }
                    }
                });
            }
        }
    });

    ui.ArtistMenuView=Backbone.View.extend({
        className:'lib-item-data box',
        tagName:'article',
        tplId:'artist_tpl',
        events:{
            'click':'selectArtist',
            'dblclick':'playArtistSongs',
            'click .delete_artist':'deleteArtist',
            'click .bio_artist':'showArtistBio',
            'click .album_link':'selectAlbum',
            'dblclick .album_link':'playAlbumSongs',
            'dragstart':'handleDragStart'
        },
        initialize:function(){
            Backbone.View.prototype.initialize.apply(this,arguments);
            _.bindAll(this,'render','selectArtist','playArtistSongs',
                    'deleteArtist','selectAlbum','playAlbumSongs','showArtistBio','handleDragStart');
            this.model.songs.bind('all',this.render);
            this.model.bind('change',this.render);
            this.model.view=this;
        },
        render:function(){
            this.renderTpl();
            this.el.draggable=true;
            this.el.dataset.artist=this.model.get('name');
            return this;
        },
        //handle drag start event
        handleDragStart:function(e){
            var event=e.originalEvent,
                dataTransferObj=event.dataTransfer,
                artist=event.srcElement.dataset.artist,
                dataTransfer=DataTransfer.create('artist',artist);
            dataTransferObj.effectAllowed='move';
            dataTransferObj.setData('text/plain',dataTransfer.toString());
        },
        selectArtist:function(){
            $('.lib-item-data').removeClass('selected-lib-item');
            $(this.el).addClass('selected-lib-item');
            AppController.detailsView.showAlbums(this.model.albumsModels,this.model.songs);
        },
        playArtistSongs:function(){
            this.selectArtist();
            AppController.playlistView.setSongsAndPlay(this.model.songs);
        },
        playAlbumSongs:function(e){
            var album=e.currentTarget.dataset.album,
                albumSongs=this.model.songs.forAlbum(album);
            AppController.detailsView.songs.reset(albumSongs);
            AppController.playlistView.setSongsAndPlay(albumSongs);
        },
        deleteArtist:function(){
            //setting deleted flag
            this.model.set({isDeleted:true});
            this.model.save();
            this.$(this.el).remove();
        },
        selectAlbum:function(e){
            var album=e.currentTarget.dataset.album,
                albumModel=this.model.songs.buildAlbumModel(album,this.model.get('name'));
            AppController.detailsView.showAlbum(albumModel);
        },
        showArtistBio:function(){
            AppController.detailsView.showBio(this.model);
        }
    });

    ui.AlbumMenuView=Backbone.View.extend({
        className:'lib-item-data box',
        tagName:'article',
        tplId:'album_lib_tpl',
        events:{
            'click':'selectAlbum',
            'dblclick':'playAlbumSongs',
            'dragstart':'handleDragStart'
        },
        initialize:function(){
            Backbone.View.prototype.initialize.apply(this,arguments);
            _.bindAll(this,'selectAlbum','playAlbumSongs','handleDragStart');
            this.model.bind('change',this.render);
            this.model.bind('add',this.render);
            this.model.view=this;

        },
        render:function(){
            var self=this;
            this.model.findImage(function(){
                self.renderTpl();
            });
            this.el.draggable=true;
            this.el.dataset.album=this.model.get('name');
            return this;
        },
        //handle drag start event
        handleDragStart:function(e){
            var event=e.originalEvent,
                dataTransferObj=event.dataTransfer,
                album=event.srcElement.dataset.album,
                dataTransfer=DataTransfer.create('album',album);
            dataTransferObj.effectAllowed='move';
            dataTransferObj.setData('text/plain',dataTransfer.toString());
        },
        playAlbumSongs:function(e){
            this.selectAlbum();
            AppController.playlistView.setSongsAndPlay(this.model.get('songs'));
        },
        selectAlbum:function(){
            $('.lib-item-data').removeClass('selected-lib-item');
            $(this.el).addClass('selected-lib-item');
            var albumSongs=this.model.get('songs');
            AppController.detailsView.showAlbum(this.model);
        }
    });

    ui.PlayListMenuView=Backbone.View.extend({
        className:'lib-item-data box',
        tagName:'article',
        tplId:'saved_playlist_tpl',
        events:{
            'click':'selectPlayList',
            'dblclick':'playPlayList',
            'click .delete_playlist':'deletePlaylist',
            'dragstart':'handleDragStart'
        },
        initialize:function(){
            Backbone.View.prototype.initialize.apply(this,arguments);
            _.bindAll(this,'render','renderPlayListInfo','selectPlayList','playPlayList','deletePlaylist','handleDragStart');
            this.model.bind('change',this.render);
            this.model.view=this;
        },
        render:function(){
            this.model.findImage(this.renderPlayListInfo);
            this.el.draggable=true;
            this.el.dataset.playlist=this.model.get('name');
            return this;
        },
        renderPlayListInfo:function(image){
            this.renderTpl({
                image:image,
                name:this.model.get('name'),
                genres:this.model.findGenres(),
                songsCount:this.model.get('songs').length
            });
        },
        //handle drag start event
        handleDragStart:function(e){
            var event=e.originalEvent,
                dataTransferObj=event.dataTransfer,
                playlist=event.srcElement.dataset.playlist,
                dataTransfer=DataTransfer.create('playlist',playlist);
            dataTransferObj.effectAllowed='move';
            dataTransferObj.setData('text/plain',dataTransfer.toString());
        },
        selectPlayList:function(){
            $('.lib-item-data').removeClass('selected-lib-item');
            $(this.el).addClass('selected-lib-item');
            AppController.detailsView.showPlayList(this.model);
        },
        playPlayList:function(){
            this.selectPlayList();
            AppController.playlistView.setSongsAndPlay(this.model.findSongs());
        },
        deletePlaylist:function(){
            this.model.destroy();
            this.$(this.el).remove();
        }
    });

    ui.SoundCloudTrackMenuView=Backbone.View.extend({
        className:'lib-item-data box',
        tagName:'article',
        tplId:'sound_cloud_track_menu_tpl',
        events:{
            'click':'playTrack'
        },
        initialize:function(){
            Backbone.View.prototype.initialize.apply(this,arguments);
            _.bindAll(this,'playTrack');
            this.model.view=this;
        },
        playTrack:function(){
              AppController.playerCtrl.play(this.model.get('url'));
        }
    });
});
$(function(){
"use strict";
    ui.PlayListView = Backbone.View.extend({
        el:$('#playing_list'),
        infoEl:$('#playing_list #song_info_view'),
        songsEl:$('#playing_list #playing_songs'),
        dropFileLabel:$('#playing_list #playing_songs label'),
        statEL:$('#playing_list footer'),
        songInfoTpl: $('#song_info_tpl').html(),
        playlistStatTpl: $('#playlist_stat_tpl').html(),
        newPlayListName:$('#new_play_list'),
        events:{
            'drop':'handleDrop',
            'blur #new_play_list':'savePlayList',
            'click #clear_playlist':'clearPlaylist'
        },
        initialize: function(){
            this.songs=new SongsList();//should be first in this method!
            _.bindAll(this,'addOne', 'addAll','currentSong','currentSongIndex',
             'randomSong','render','clearPlaylist','selectSong',
              'playSongModel','savePlayList','setPlayListModel','removePlayListModel','setSongsAndPlay');
            this.songs.bind('selected',this.selectSong);
            this.songs.bind('add',this.addOne);
            this.songs.bind('reset',this.addAll);
            this.songs.bind('all',this.render);
            var playlist=AppController.settings.getPlayList();
            if(playlist){
                this.songs.reset(playlist.models);
                var lastSong=AppController.settings.getLastSong();
                if(lastSong){
                    this.selectSong(new Song(lastSong));
                }
            }
        },
        render:function(){
            this.statEL.html(_.template(this.playlistStatTpl,{songsCount:this.songs.length}));
            return this;
        },
        setSongsAndPlay:function(songs){
            this.songs.reset(songs.models);
            //getting first song
            var firstSong=this.songs.first();
            if(firstSong){
                //playing first song from list
                firstSong.view.playSong();
            }
            //saving settings
            AppController.settings.savePlayList(songs);
        },
        setPlayListModel:function(playList){
            this.playList=playList;
            this.newPlayListName.val(this.playList.get('name'));
        },
        removePlayListModel:function(){
            this.playList=null;
            this.newPlayListName.val('Unsaved list');
        },
        savePlayList:function(){
            var newPlaylistName=this.newPlayListName.val();
            if(newPlaylistName!=='Unsaved list'){
                if(!this.playList){
                    this.playList=new PlayList();
                }
                var songs=this.songs.toJSON();
                this.playList.set({name:newPlaylistName,songs:songs});
                this.playList.save();
                AppController.libraryMenu.playLists.add(this.playList);
            }
        },
        clearPlaylist:function(){
            this.songsEl.empty();
            this.songs.reset();
            AppController.settings.savePlayList(this.songs);
            this.render();
        },
        addOne:function(song){
            if(song.get('fileName')){
                this.dropFileLabel.remove();
                var view=new ui.SongMiniView({model:song});
                song.view=view;
                this.songsEl.append(view.render().el);
            }
        },
        addAll:function(){
            if(this.songs.length!==0){
                this.songsEl.empty();
                this.songs.each(this.addOne);
            }
        },
        handleDrop:function(e){
            e.stopPropagation();
            e.preventDefault();
            var dataTransfer=e.originalEvent.dataTransfer;
            if(dataTransfer && dataTransfer.getData('text/plain')){
                var transfer=DataTransfer.fromString(dataTransfer.getData('text/plain'));
                if(transfer){
                    if('artist'===transfer.type){
                        //we have artist name here. Get all his songs and add to list
                        var artist=AppController.libraryMenu.artists.forName(transfer.value);
                        if(artist){
                            var songsFromPlayList=this.songs;
                            artist.songs.each(function(song){
                                songsFromPlayList.add(song);
                            });
                        }
                    }
                    else if('album'===transfer.type){
                        //we have album name here. Get all his songs and add to list
                        var album=AppController.libraryMenu.albums.forName(transfer.value);
                        if(album){
                            var songsFromPlayList=this.songs;
                            album.get('songs').each(function(song){
                                songsFromPlayList.add(song);
                            });
                        }
                    }
                    else if('playlist'===transfer.type){
                        //we have album name here. Get all his songs and add to list
                        var playList=AppController.libraryMenu.playLists.forName(transfer.value);
                        if(playList){
                            var songsFromPlayList=this.songs;
                            playList.findSongs().each(function(song){
                                songsFromPlayList.add(song);
                            });
                        }
                    }
                    else if('song'===transfer.type){
                        //we have song here. Add it to playlist
                        var song=new Song(transfer.value);
                        this.songs.add(song);
                    }
                }
            }
            else{
                AppController.appView.dropFiles(e);
            }
        },
        selectSong:function(song){
            this.selectedSong=song;
            var self=this;
            song.findImage(function(){
                self.infoEl.html(_.template(self.songInfoTpl,song.toJSON()));
            });
        },
        randomSong:function(){
            var randomSong=Math.floor(Math.random()*this.songs.length);
            if(randomSong===this.currentSong()){
                return this.randomSong();
            }
            return randomSong;
        },
        currentSong:function(){return this.songs.at(this.currentSongIndex());},
        currentSongIndex:function(){return this.songs.indexOf(this.selectedSong);},
        next:function(playSongFlag){
            var playSong=!playSongFlag,
                nextSongId=-1;
            if(playSong && AppController.settings.isShuffle()){
                nextSongId=this.randomSong();
            }
            else{
                var indexOfSelectedSong=this.currentSongIndex();
                if(indexOfSelectedSong===this.songs.length-1){
                    //to have first one
                    indexOfSelectedSong=-1;
                    if(!AppController.settings.isRepeat()){
                        playSong=false;
                    }
                }
                nextSongId=indexOfSelectedSong+1;
            }
            var nextSong=this.songs.at(nextSongId);
            this.playSongModel(nextSong,playSong);
        },
        previous:function(playSongFlag){
            var playSong=!playSongFlag,
                indexOfSelectedSong=this.currentSongIndex();
            if(indexOfSelectedSong===0){
                //to have last one
                indexOfSelectedSong=this.songs.length;
            }
            var previousSong=this.songs.at(indexOfSelectedSong-1);
            this.playSongModel(previousSong,playSong);
        },
        playSongModel:function(song,playSong){
            if(playSong && song && song.view){
                song.view.playSong();
            }
            else if(!playSong && song && song.view){
                song.view.selectSong();
            }
        }
    });

    ui.SongMiniView=Backbone.View.extend({
        className:'song-data',
        tplId:'song_mini_tpl',
        events:{
            'click .song':'selectSong',
            'dblclick .song':'playSong'
        },
        initialize:function(){
            Backbone.View.prototype.initialize.apply(this,arguments);
            _.bindAll(this,'selectSong','playSong');
        },
        render:function(){
            this.el.draggable=true;
            this.renderTpl();
            return this;
        },
        selectSong:function(){
            $('.song-data').removeClass('selected_song');
            $(this.el).addClass('selected_song');
            this.model.trigger('selected',this.model);
        },
        playSong:function(){
            //saving settings
            AppController.settings.saveLastSong(this.model.toJSON());
            AppController.settings.saveLastAlbum(this.model.get('album'));
            AppController.settings.saveLastArtist(this.model.get('artist'));

            this.selectSong();
            fs.util.getFileURL(this.model.get('fileName'),function(er,url){
                if(!er){
                    AppController.playerCtrl.play(url);
                }
            });
        }
    });
});
$(function(){
    "use strict";
    //2nd column view
    ui.DetailsView=Backbone.View.extend({
        el:$('#filtered_lib'),
        libDetailsPanel:$('#filtered_lib_content'),
        artistBioPanel:$('#artist_bio'),
        events:{
            'dragstart':'handleDragStart'
        },
        initialize:function(){
            Backbone.View.prototype.initialize.apply(this,arguments);
            _.bindAll(this, 'showAlbums','showAlbum','showPlayList','handleDragStart','showBio','hideBio');
            this.artistBioView=new ui.ArtistBioView();
        },
        showBio:function(artist){
            this.artistBioPanel.show();
            this.artistBioView.setArtistModel(artist);
            this.artistBioView.render();
            this.libDetailsPanel.hide();
        },
        hideBio:function(){
            this.artistBioPanel.hide();
            this.artistBioView.clear();
            this.libDetailsPanel.show();
            this.libDetailsPanel.empty();
        },
        //AlbumList and array of songs
        showAlbums:function(albumsModels,songs){
            this.hideBio();
            if(albumsModels){
                albumsModels.each(this.showAlbum);
            }
            this.songs=songs;
        },
        showAlbum:function(albumModel){
            this.hideBio();
            //todo (anton) check this!!!
            this.songs=albumModel.get('songs');
            var albumView=new ui.AlbumView({model:albumModel});
            this.libDetailsPanel.append(albumView.render().el);
        },
        showPlayList:function(playList){
            this.hideBio();
            var playListView=new ui.PlayListFullView({model:playList});
            this.libDetailsPanel.append(playListView.render().el);
        },
        handleDragStart:function(e){
            var event=e.originalEvent,
                dataTransferObj=event.dataTransfer,
                songId=event.srcElement.dataset.id;
            dataTransferObj.effectAllowed='move';

            if(this.songs){
                var song=this.songs.get(songId),
                    dataTransfer=DataTransfer.create('song',song);
                dataTransferObj.setData('text/plain',dataTransfer.toString());
            }
        }
    });

    ui.ArtistBioView=Backbone.View.extend({
        el: $('#artist_bio'),
        tplId:'artist_bio_tpl',
        initialize:function(){
            Backbone.View.prototype.initialize.apply(this,arguments);
           _.bindAll(this,'setArtistModel','renderArtistBio','clear');
        },
        setArtistModel:function(artist){
           this.model=artist;
        },
        render:function(){
            if(this.model){
                dataService.getArtistBio(this.model.get('name'),this.renderArtistBio);
            }
            return this;
        },
        renderArtistBio:function(data){
            this.renderTpl({
                bio:unescape(data.summary),
                profiles:data.profile||{}
            });
        },
        clear:function(){
            $(this.el).html('');
        }
    });

    ui.AlbumView=Backbone.View.extend({
        className:'lib_item_full_info_panel',
        tagName:'article',
        initialize:function(){
            Backbone.View.prototype.initialize.apply(this,arguments);
            _.bindAll(this,'addSong');
        },
        render:function(){
            this.albumInfoView=new ui.AlbumInfoView({model:this.model});
            $(this.el).append(this.albumInfoView.render().el);
            if(this.model.get('songs')){
                this.model.get('songs').each(this.addSong);
            }
            return this;
        },
        addSong:function(song,key){
            var view=new ui.SongView({model:song,key:key,songs:this.model.get('songs')});
            song.albumView=view;
            $(this.el).append(view.render().el);
        }
    });

    ui.PlayListFullView=Backbone.View.extend({
        className:'lib_item_full_info_panel',
        tagName:'article',
        tplId:'detailed_playlist_info_tpl',
        events:{
            'click':'playSongs'
        },
        initialize: function(){
            Backbone.View.prototype.initialize.apply(this,arguments);
            _.bindAll(this,'addSong','renderPlayListInfo','playSongs');
        },
        render:function(){
            this.model.findImage(this.renderPlayListInfo);
            return this;
        },
        renderPlayListInfo:function(image){
            this.renderTpl({
                image:image,
                name:this.model.get('name')
            });
            _.each(this.model.get('songs'),this.addSong);
        },
        addSong:function(songData,key){
            var song=new Song(songData),
                view=new ui.SongView({
                    model:song,
                    key:key,
                    songs:this.model.get('songs'),
                    playList:this.model
                });
            song.albumView=view;
            $(this.el).append(view.render().el);
        },
        playSongs:function(){
            AppController.playlistView.setSongsAndPlay(this.model.get('songs'));
        }
    });

    ui.AlbumInfoView=Backbone.View.extend({
        className:'detailed_album_info_panel box',
        tagName:'section',
        tplId:'detailed_album_info_tpl',
        events:{
            'click':'playSongs'
        },
        initialize:function(){
            Backbone.View.prototype.initialize.apply(this,arguments);
            _.bindAll(this,'renderAlbumInfo','playSongs');
        },
        renderAlbumInfo:function(data){
            this.renderTpl({
                image:data.image,
                name:this.model.get('name'),
                releaseDate:data.releaseDate
            });
        },
        render:function(){
            dataService.getAlbumInfo(this.model.get('artist'),this.model.get('name'),this.renderAlbumInfo);
            return this;
        },
        playSongs:function(){
            AppController.playlistView.setSongsAndPlay(this.model.get('songs'));
        }
    });

    ui.SongView=Backbone.View.extend({
        className:'song-data',
        tplId:'song_tpl',
        events:{
            'click':'selectSong',
            'click .delete_album_song':'deleteSong',
            'dblclick .song':'playSongs'
        },
        initialize:function(){
            Backbone.View.prototype.initialize.apply(this,arguments);
            _.bindAll(this,'selectSong','deleteSong','onDeleteSong','playSongs','render');
        },
        render:function(){
            this.el.draggable=true;
            this.el.dataset.songname=this.model.get('title');
            this.el.dataset.id=this.model.id;
            this.el.id=this.model.id;
            this.renderTpl({
                track:this.model.get('track')||this.options.key+1,
                title:this.model.get('title')
            });
            return this;
        },
        selectSong:function(){
            $('.song-data').removeClass('selected_song');
            $(this.el).addClass('selected_song');
        },
        deleteSong:function(){
            this.model.bind('destroy',this.onDeleteSong);
            this.model.remove();
        },
        onDeleteSong:function(){
            var view=this.model.albumView;
            if(view){
                view.remove();
            }
        },
        playSongs:function(){
            var songs=this.options.songs;
            this.selectSong();
            AppController.playlistView.setSongsAndPlay(songs);
            if(this.options.playList){
                AppController.playlistView.setPlayListModel(this.options.playList);
            }
            else{
                AppController.playlistView.removePlayListModel();
            }
        }
    });
});
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