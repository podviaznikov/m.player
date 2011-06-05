/**(c) 2011 Enginimation Studio (http://enginimation.com). May be freely distributed under the MIT license.*/
"use strict";
var global=window;
var AppController={
	init:function(){
        var newHeight = $(window).height()-105;
        $('.scrollable_panel').height(newHeight);

		this.appView = new ui.AppView;
		this.playerCtrl=new ui.PlayerCtrl;
		this.visualizationView = new ui.VisualizationView;
        this.visualizationView.el.height(newHeight);
        var config={
            dbName:'mdb',
            dbDescription:'m.player database',
            dbVersion:'1',
            stores:[Song.definition,Artist.definition,PlayList.definition]
        };
        Porridge.init(config,function(){
            AppController.playlistView = new ui.PlayListView;
            AppController.libraryMenu = new ui.LibraryMenu;
            AppController.songsView = new ui.SongsView;
        });

        //doesn't work now. track http://code.google.com/p/chromium/issues/detail?id=7469
        //$(document.body).bind("online", this.checkNetworkStatus);
        //$(document.body).bind("offline", this.checkNetworkStatus);
        //this.checkNetworkStatus();
	}

};
//storing all users' settings(locally): volume, last music, pressed buttons etc.
var settings={
    saveShuffle:function(isShuffle){
        global.localStorage.setItem('isShuffle',isShuffle);
    },
    isShuffle:function(){
        var value = global.localStorage.getItem('isShuffle');
        return value?JSON.parse(value):false;
    },
    saveRepeat:function(isRepeat){
        global.localStorage.setItem('isRepeat',isRepeat);
    },
    isRepeat:function(){
        var value = global.localStorage.getItem('isRepeat');
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
        var models = JSON.parse(global.localStorage.getItem('playlist'));
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
    }
};


"use strict";
var Song = Porridge.Model.extend({
    defaults:{
        album:'No information',
        title:'No information',
        artist:'No information',
        year:'',
        genre:''
    }
},{
    definition:{
        name:'song',
        key:'id',
        indexes:[{name:'artists',field:'artist'}]
    }
});
var SongsList = Porridge.Collection.extend({
    model:Song,
    comparator:function(song){return song.get('track');},
    forAlbum:function(album)
    {
        return this.filter(function(song){return song.get('album')===album;});
    }
});
var Artist = Porridge.Model.extend({
    initialize:function(){
        _.bindAll(this,'setParameterFromSongs');
        if(!this.get('id')){
            this.id=UUID.generate();
            this.set({id:this.id});
        }
        this.songs = new SongsList;
        this.songs.bind('retrieved',this.setParameterFromSongs);
        this.songs.fetchByKey('artists',this.get('name'));
    },
    setParameterFromSongs:function(){
        var albums = _.uniq(this.songs.pluck('album'));
        var genres = _.uniq(this.songs.pluck('genre'));
        var songsCount = this.songs.length;
        this.set({albums:albums,genres:genres,songsCount:songsCount});
    }
},{
    definition:{
        name:'artist',
        key:'name'
    }
});
var ArtistsList = Porridge.Collection.extend({
    model:Artist,
    forName:function(artistName){
        return this.find(function(artist){ return artist.get('name') === artistName; });
    },
    comparator:function(song){return song.get('name');}
});

var PlayList = Porridge.Model.extend({
//    getGenres:function()
//    {
//        var songs=this.get('songs');
//        var genres=_.map(songs, function(song){ return song.genre; });
//        return _.uniq(genres);
//    }
},{
    definition:{
        name:'playlist',
        key:'id'
    }
});
var PlayLists = Porridge.Collection.extend({model: PlayList});
var ui={};
$(function(){
    ui.AppView = Backbone.View.extend({
        el: $('body'),
        progress:$('#uploading_files_progress progress'),
        infoPanels:$('section.info_panel'),
        helpPanels:$('section.help_panel'),
        mainPanels:$('section.main_panel'),
        isRegularMode:true,
        events:{
            'keyup':'keyPressed',
            'dragover':'dragOverFiles',
            'drop .main_panel':'dropFiles',
            'change #drop_files':'dropFiles',
            'change #drop_folder':'dropFiles',
            'click #import_songs_directory':'importMusicDirectory',
            'click #import_songs_files':'importMusicFiles'
        },
        initialize:function(){
            _.bindAll(this,'dragOverFiles','dropFiles','handleFileSelect','showHelp',
                    'hideHelp','showFullScreen','hideFullScreen','keyPressed',
                    'importMusicDirectory','importMusicFiles','processOneAudioFile');
        },
        importMusicDirectory:function(){
            this.$('#drop_folder').click();
        },
        importMusicFiles:function(){
            this.$('#drop_files').click();
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
                files = target.files;
            if(files && files.length>0){
               this.handleFileSelect(files); // handle FileList object.
            }
        },
        handleFileSelect:function(files){
            var self = this,
                fileProcessingFunctions=[];
                this.$('#file_upload_status_dialog').addClass('active');
            _.each(files,function(file,index)
            {
                var bindedFunct=async.apply(self.processOneAudioFile,file,index,files.length);
                fileProcessingFunctions.push(bindedFunct);
            });
            async.series(fileProcessingFunctions,
            function(err, results){
                self.$('#file_upload_status_dialog').removeClass('active');
            });
        },
        //some refactoring should be done
        processOneAudioFile:function(file,index,filesAmount,callback){
            var percent = Math.floor(((index+1)/filesAmount)*100),
                progressElement = this.$(this.progress);
            this.$('#file_index').html(index);
            this.$('#total_files_amount').html(filesAmount);
            this.$('#uploading_files_progress header span').html(file.name);
            fs.read.fileAsBinaryString(file,function(readError,data,initialFile){
                if(readError){return;}
                ID3v2.parseFile(data,function(tags){
                    var song = new Song();
                    tags.fileName=song.id+initialFile.extension();
                    tags.originalFileName=initialFile.name;
                    song.set(tags);
                    fs.write.file(initialFile,function(writeError){
                        if(!writeError){
                            song.save();
                            AppController.playlistView.songs.add(song);
                            progressElement.val(percent);
                            var artistName = song.get('artist'),
                                artist=AppController.libraryMenu.artists.forName(artistName);
                            if(!artist){
                                artist = new Artist({name:artistName});
                                dataService.getArtistImage(artist.get('name'),function(image){
                                    artist.set({image:image});
                                    artist.save();
                                    AppController.libraryMenu.artists.add(artist);
                                });
                            }
                            callback(null);
                        }
                    },song.get('fileName'));
               });
            });
        },
        showHelp:function(){
            this.isRegularMode=false;
            this.el.removeClass('fullscreen');
            this.helpPanels.removeClass('hidden');
            AppController.visualizationView.hide();
        },
        hideHelp:function(){
            this.isRegularMode=true;
            this.infoPanels.removeClass('hidden');
            this.helpPanels.addClass('hidden');
        },
        showFullScreen:function(){
            this.infoPanels.addClass('hidden');
            this.el.addClass('fullscreen');
            AppController.visualizationView.show();
        },
        hideFullScreen:function(){
            this.el.removeClass('fullscreen');
            if(this.isRegularMode){
                this.mainPanels.removeClass('hidden');
            }else{
                this.helpPanels.removeClass('hidden');
            }
            AppController.visualizationView.hide();
        },
        keyPressed:function(event)
        {
            var keyCode=event.keyCode,
                currentSong=undefined;
            if(AppController.playlistView){
                currentSong= AppController.playlistView.currentSong();
            }
            if(keyCode==40){
                //down arrow
                AppController.playlistView.next(false);
            } else if(keyCode==38){
                //up key
                AppController.playlistView.previous(false);
            }else if(keyCode==13){
                //enter
                AppController.playlistView.destroyFileURL();
                if(currentSong){
                    currentSong.view.playSong();
                }
            }else if(keyCode==32){
                //space
                AppController.playerCtrl.togglePause();
            }else if(keyCode==46){
                //delete-delete song from playlist
               if(currentSong){
                    currentSong.view.remove();
                }
            }else if(keyCode==27){
                //escape-comeback to the normal view
                AppController.playerCtrl.turnOffFullScreen();
                AppController.playerCtrl.turnOffHelpMode();
            }
        }
    });

    ui.VisualizationView = Backbone.View.extend({
        el: $('#playing_visualization'),
        tpl: $('#visualization_tpl').html(),
        initialize:function(){
            _.bindAll(this,'selectSong','render','show','hide','renderAlbumPoster');
        },
        selectSong:function(song){
            this.model = song;
        },
        show:function(){
            this.el.show();
            this.render();
        },
        hide:function(){
            this.el.hide();
        },
        renderAlbumPoster:function(image){
            var html = _.template(this.tpl,{image:image });
            $(this.el).html(html);
        },
        render:function(){
            if(this.model){
                dataService.getAlbumPoster(this.model.get('artist'),this.model.get('album'),this.renderAlbumPoster);
            }
            return this;
        }
    });
});
"use strict";
$(function(){
    ui.LibraryMenu = Backbone.View.extend({
        el:$('#library_menu'),
        searchField:$('#library_menu header input'),
        artistsContent:$('#artists_library_content'),
        playListsContent:$('#playlists_library_content'),
        events:{
            'click #show_artists':'showArtists',
            'click #show_playlists':'showPlayLists',
            'blur input':'filterLibrary',
            'keyup input':'keyPressed'
        },
        initialize:function(){
            this.artists=new ArtistsList;//should be first in this method!
            this.playLists=new PlayLists;//should be first in this method!
            _.bindAll(this, 'addArtist', 'addPlayList','addPlayLists','showArtists','showPlayLists','allArtistsLoaded','filterLibrary','keyPressed');
            this.artists.bind('add',this.addArtist);
            this.artists.bind('retrieved',this.allArtistsLoaded);
            this.playLists.bind('add',this.addPlayList);
            this.playLists.bind('refresh',this.addPlayLists);

            this.artists.fetch();

            this.playLists.fetch();
        },
        keyPressed:function(event){
            var keyCode = event.keyCode;
            if(keyCode==13){
                this.filterLibrary();
            }
        },
        allArtistsLoaded:function(){
            var lastArtist=settings.getLastArtist();
            if(lastArtist){
                var lastPlayedArtist = this.artists.forName(lastArtist);
                if(lastPlayedArtist && lastPlayedArtist.view){
                    lastPlayedArtist.view.selectArtist();
                }
            }
        },
        showArtists:function(){
            this.artistsContent.show();
            this.playListsContent.hide();
        },
        showPlayLists:function(){
            this.artistsContent.hide();
            this.playListsContent.show();
        },
        addArtist:function(artist){
            //do not show view if artist has no name or songs
            if(artist.get('name') && artist.get('songsCount')>0){
                var view = new ui.ArtistMenuView({model:artist});
                this.artistsContent.append(view.render().el);
            }
        },
        addPlayList:function(playList){
            var view = new ui.PlayListMenuView({model:playList});
            this.playListsContent.append(view.render().el);
        },
        addPlayLists:function(){
            this.playLists.each(this.addPlayList);
        },
        filterLibrary:function(){
            var filterValue=this.searchField.val();
            if(!filterValue || filterValue==''){
                this.artists.each(function(artist)
                {
                    artist.view.show();
                });
            }else{
                this.artists.each(function(artist){
                    if(artist.get('name').indexOf(filterValue) == -1){
                        artist.view.hide();
                    }else{
                        artist.view.show();
                    }
                });
            }
        }
    });

    ui.ArtistMenuView = Backbone.View.extend({
        className:'lib-item-data box',
        tagName: 'article',
        tpl:$('#artist_tpl').html(),
        events:{
            'click':'selectArtist',
            'dblclick':'playArtistSongs',
            'click .delete_artist':'deleteArtist',
            'click .bio_artist':'showArtistBio',
            'click .album_link': 'selectAlbum',
            'dbclick .album_link':'playAlbumSongs'
        },
        initialize:function(){
            _.bindAll(this, 'render','selectArtist','playArtistSongs','hide','show',
                    'deleteArtist','selectAlbum','playAlbumSongs','showArtistBio');
            this.model.songs.bind('all',this.render);
            this.model.bind('change',this.render);
            this.model.view=this;
        },
        render: function(){
            var html = _.template(this.tpl,{
                image:this.model.get('image'),
                name:this.model.get('name'),
                albums:this.model.get('albums'),
                genres:this.model.get('genres'),
                songsCount:this.model.get('songsCount')
            });
            $(this.el).html(html);
            return this;
        },
        selectArtist:function(){
            $('.lib-item-data').removeClass('selected-lib-item');
            $(this.el).addClass('selected-lib-item');
            AppController.songsView.showAlbums(this.model.get('albums'),this.model.get('name'),this.model.songs);
        },
        playArtistSongs:function(){
            this.selectArtist();
            AppController.playlistView.setSongsAndPlay(this.model.songs.models);
        },
        playAlbumSongs:function(e){
            var album=e.currentTarget.dataset.album,
                albumSongs=this.model.songs.forAlbum(album);
            AppController.songsView.songs.refresh(albumSongs);
            AppController.playlistView.setSongsAndPlay(albumSongs);
        },
        deleteArtist:function(){
            this.model.destroy();
            this.$(this.el).remove();
        },
        selectAlbum:function(e){
            var album=e.currentTarget.dataset.album,
                albumSongs=this.model.songs.forAlbum(album);
            AppController.songsView.songs.refresh(albumSongs);
        },
        showArtistBio:function(){
            alert('x');
        },
        hide:function(){
            this.$(this.el).hide();
        },
        show:function(){
            this.$(this.el).show();
        }
    });

    ui.PlayListMenuView = Backbone.View.extend({
        className:'lib-item-data box',
        tagName: 'article',
        tpl:$('#saved_playlist_tpl').html(),
        events:{
            'click':'selectPlayList',
            'dblclick':'playPlayList',
            'click .delete_playlist':'deletePlaylist'
        },
        initialize:function(){
            _.bindAll(this, 'render','selectPlayList','playPlayList','deletePlaylist');
            this.model.bind('change',this.render);
            this.model.view=this;
        },
        render:function(){
            var html = _.template(this.tpl,{
                image:'css/images/no_picture.png',
                name:this.model.get('name'),
                songsCount:this.model.get('songs').length
            });
            $(this.el).html(html);
            return this;
        },
        selectPlayList:function(){
            $('.lib-item-data').removeClass('selected-lib-item');
            $(this.el).addClass('selected-lib-item');
            AppController.songsView.showPlayList(this.model);
        },
        playPlayList:function(){
           this.selectPlayList();
            AppController.playlistView.setSongsAndPlay(this.model.get('songs'));
        },
        deletePlaylist:function(){
            this.model.destroy();
            this.$(this.el).remove();
        }
    });
});
"use strict";
$(function(){
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
            'drop':'dropFiles',
            'blur #new_play_list':'savePlayList',
            'click #clear_playlist':'clearPlaylist'
        },
        initialize: function(){
            this.songs=new SongsList;//should be first in this method!
            _.bindAll(this, 'addOne', 'addAll','saveFileURL','destroyFileURL','currentSong', 'currentSongIndex',
             'randomSong','renderAlbumInfo','render','clearPlaylist',
              'playSongModel','savePlayList','setPlayListModel','removePlayListModel','setSongsAndPlay');
            this.bind('song:select',this.selectSong);
            this.bind('url:create',this.saveFileURL);
            this.songs.bind('add',this.addOne);
            this.songs.bind('refresh',this.addAll);
            this.songs.bind('all',this.render);
            var playlist=settings.getPlayList();
            if(playlist){
                this.songs.refresh(playlist.models);
                var lastSong=settings.getLastSong();
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
            this.songs.refresh(songs);
            //getting first song
            var firstSong=this.songs.first();
            if(firstSong){
                //playing first song from list
                firstSong.view.playSong();
                //saving settings
                settings.saveLastAlbum(firstSong.get('album'));
                settings.saveLastArtist(firstSong.get('artist'));
            }
            //saving settings
            settings.savePlayList(songs);
        },
        setPlayListModel:function(playList){
            this.playList = playList;
            this.newPlayListName.val(this.playList.get('name'));
        },
        removePlayListModel:function(){
            this.playList = null;
            this.newPlayListName.val('Unsaved list');
        },
        savePlayList:function(){
            var newPlaylistName=this.newPlayListName.val();
            if(newPlaylistName!='Unsaved list'){
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
            this.songs.refresh([]);
            settings.savePlayList(this.songs);
            this.render();
        },
        addOne:function(song){
            if(song.get('fileName')){
                this.dropFileLabel.remove();
                var view=new ui.SongMiniView({model:song,playlist:this});
                song.view=view;
                this.songsEl.append(view.render().el);
            }
        },
        addAll:function(){
            if(this.songs.length!=0){
                this.songsEl.empty();
                this.songs.each(this.addOne);
            }
        },
        dropFiles:function(e){
            e.stopPropagation();
            e.preventDefault();
            var dataTransfer=e.originalEvent.dataTransfer;
            if(dataTransfer&&dataTransfer.getData('text/plain')){
                var songJSON=JSON.parse(dataTransfer.getData('text/plain'));
                if(songJSON){
                    var song = new Song(songJSON);
                    this.songs.add(song);
                }
            }else{
                AppController.appView.dropFiles(e);
            }
        },
        selectSong:function(song){
            this.selectedSong=song;
            dataService.getAlbumImage(this.selectedSong.get('artist'),this.selectedSong.get('album'),this.renderAlbumInfo);
        },
        renderAlbumInfo:function(image){
            this.infoEl.html(_.template(this.songInfoTpl,{
                image:image,
                name:this.selectedSong.get('title'),
                artist:this.selectedSong.get('artist'),
                album:this.selectedSong.get('album'),
                year:this.selectedSong.get('year')
            }));
        },
        saveFileURL:function(url){
            this.fileURL=url;
        },
        destroyFileURL:function(){
            if(this.fileURL){
                fs.util.destroyFileURL(this.fileURL);
            }
        },
        randomSong:function(){
            var randomSong=Math.floor(Math.random()*this.songs.length);
            if(randomSong==this.currentSong()){
                return this.randomSong();
            }
            return randomSong;
        },
        currentSong:function(){return this.songs.at(this.currentSongIndex());},
        currentSongIndex:function(){return this.songs.indexOf(this.selectedSong);},
        next:function(playSongFlag){
            var playSong=!playSongFlag,
                nextSongId=-1;
            if(playSong && settings.isShuffle()){
                nextSongId=this.randomSong();
            }else{
                var indexOfSelectedSong=this.currentSongIndex();
                if(indexOfSelectedSong==this.songs.length-1){
                    //to have first one
                    indexOfSelectedSong=-1;
                    if(!settings.isRepeat()){
                        playSong=false;
                    }
                }
                nextSongId=indexOfSelectedSong+1;
            }
            var nextSong=this.songs.at(nextSongId);
            this.playSongModel(nextSong,playSong);
        },
        previous:function(playSongFlag){
            var playSong=!playSongFlag.
                indexOfSelectedSong=this.currentSongIndex();
            if(indexOfSelectedSong==0){
                //to have last one
                indexOfSelectedSong=this.songs.length;
            }
            var previousSong=this.songs.at(indexOfSelectedSong-1);
            this.playSongModel(previousSong,playSong);
        },
        playSongModel:function(song,playSong){
            if(playSong){
                this.destroyFileURL();
                if(song && song.view){
                    song.view.playSong();
                }
            }else if(!playSong && song && song.view){
                song.view.selectSong();
            }
        }
    });

    ui.SongMiniView = Backbone.View.extend({
        className:'song-data',
        tpl:$('#song_mini_tpl').html(),
        events:{
            'click .song':'selectSong',
            'dblclick .song':'playSong'
        },
        initialize:function(){
            _.bindAll(this,'render','selectSong','playSong','songFileLoaded');
        },
        render:function(){
            this.el.draggable=true;
            //todo(anton) do we really need this in markup?
            this.el.dataset.songname=this.model.get('title');
            this.el.dataset.id=this.model.id;
            this.el.id=this.model.id;
            var html = _.template(this.tpl,{
                track:this.model.get('track'),
                title:this.model.get('title'),
                album:this.model.get('album'),
                year:this.model.get('year')
            });
            $(this.el).html(html);
            return this;
        },
        selectSong:function(){
            $('.song-data').removeClass('selected_song');
            $(this.el).addClass('selected_song');
            this.options.playlist.trigger('song:select',this.model);
            AppController.visualizationView.selectSong(this.model);
        },
        playSong:function(){
            settings.saveLastSong(this.model.toJSON());
            this.selectSong();
            fs.util.createFileURL(this.model.get('fileName'),this.songFileLoaded);
        },
        songFileLoaded:function(er,url){
            if(!er){
                this.options.playlist.trigger('url:create',url);
                AppController.playerCtrl.play(url);
            }
        }
    });
});

"use strict";
$(function(){
    ui.AlbumView = Backbone.View.extend({
        className: 'lib_item_full_info_panel',
        tagName: 'article',
        initialize: function(){
            _.bindAll(this, 'addSong','render');
        },
        render:function(){
            this.albumInfoView = new ui.AlbumInfoView({model:this.model});
            $(this.el).append(this.albumInfoView.render().el);
            _.each(this.model.songs,this.addSong);
            return this;
        },
        addSong:function(song,key){
            var view = new ui.SongView({model:song,key:key,songs:this.model.songs});
            song.view = view;
            $(this.el).append(view.render().el);
        }
    });

    ui.PlayListFullView = Backbone.View.extend({
        className: 'lib_item_full_info_panel',
        tagName: 'article',
        tpl:$('#detailed_playlist_info_tpl').html(),
        events:{
            'click':'playSongs'
        },
        initialize: function(){
            _.bindAll(this, 'addSong','render','playSongs');
        },
        render:function(){
            var html = _.template(this.tpl,{
                image:'css/images/no_picture.png',
                name:this.model.get('name')
            });
            $(this.el).append(html);
            _.each(this.model.get('songs'),this.addSong);
            return this;
        },
        addSong:function(song,key){
            var song = new Song(song),
                view = new ui.SongView({
                    model:song,
                    key:key,
                    songs:this.model.get('songs'),
                    playList:this.model
                });
            song.albumView = view;
            $(this.el).append(view.render().el);
        },
        playSongs:function(){
            AppController.playlistView.setSongsAndPlay(this.model.get('songs'));
        }
    });

    ui.AlbumInfoView = Backbone.View.extend({
        className: 'detailed_album_info_panel box',
        tagName: 'section',
        tpl:$('#detailed_album_info_tpl').html(),
        events:{
            'click':'playSongs'
        },
        initialize:function(){
            _.bindAll(this,'renderAlbumInfo','render','playSongs');
        },
        renderAlbumInfo:function(data){
            var html = _.template(this.tpl,{
                image:data.image,
                name:data.name,
                releaseDate:data.releaseDate
            });
            $(this.el).append(html);
        },
        render:function(){
            dataService.getAlbumInfo(this.model.artist,this.model.album,this.renderAlbumInfo);
            return this;
        },
        playSongs:function(){
            AppController.playlistView.setSongsAndPlay(this.model.songs);
        }
    });

    ui.SongView = Backbone.View.extend({
        className:'song-data',
        tpl:$('#song_tpl').html(),
        events:{
            'click':'selectSong',
            'click .delete_album_song':'deleteSong',
            'dblclick .song':'playSongs'
        },
        initialize:function(){
            _.bindAll(this,'selectSong','deleteSong','onDeleteSong','playSongs','render');
        },
        render:function(){
            this.el.draggable=true;
            this.el.dataset.songname=this.model.get('title');
            this.el.dataset.id=this.model.id;
            this.el.id=this.model.id;
            var html = _.template(this.tpl,{
                track:this.model.get('track')||this.options.key+1,
                title:this.model.get('title')
            });
            $(this.el).html(html);
            return this;
        },
        selectSong:function(){
            $('.song-data').removeClass('selected_song');
            $(this.el).addClass('selected_song');
        },
        deleteSong:function(){
            this.model.bind('destroy',this.onDeleteSong)
            this.model.destroy();
        },
        onDeleteSong:function(){
            var view = this.model.albumView||this.model.view;
            if(view){
                view.remove();
            }
            fs.util.remove(this.model.get('fileName'));
        },
        playSongs:function(){
            this.selectSong();
            var songs=this.options.songs;
            AppController.playlistView.setSongsAndPlay(songs);
            if(this.options.playList){
                AppController.playlistView.setPlayListModel(this.options.playList);
            }else{
                AppController.playlistView.removePlayListModel();
            }
        }
    });
    //2nd column view
    ui.SongsView = Backbone.View.extend({
        el:$('#filtered_lib'),
        filteredLibContent:$('#filtered_lib_content'),
        events:{
            'dragstart':'handleDragStart'
        },
        initialize:function(){
            _.bindAll(this, 'showAlbums','showPlayList','handleDragStart');
            this.mapping={};
        },
        showAlbums:function(albums,artist,songs){
            this.filteredLibContent.empty();
            this.songs=songs;
            if(albums){
                for(var i=0;i<albums.length;i++){
                    var album = albums[i],
                        albumSongs = songs.filter(function(song){return song.get('album')===album;}),
                        albumView = new ui.AlbumView({model:{album:album,artist:artist,songs:albumSongs}});
                    //what is this? key of the array should be always number
                    this.mapping[album] = albumSongs;
                    this.filteredLibContent.append(albumView.render().el);
                }
            }
        },
        showPlayList:function(playList){
            this.filteredLibContent.empty();
            var playListView = new ui.PlayListFullView({model:playList});
            this.filteredLibContent.append(playListView.render().el);
        },
        handleDragStart:function(e){
            var event=e.originalEvent,
                dataTransferObj=event.dataTransfer,
                songId=event.srcElement.dataset['id'];
            dataTransferObj.effectAllowed = 'move';

            if(this.songs){
                var song = this.songs.get(songId);
                dataTransferObj.setData('text/plain', JSON.stringify(song.toJSON()));
            }
        }
    });

});

"use strict";
$(function(){
    ui.PlayerCtrl = Backbone.View.extend({
        el:$('#player'),
        playToggle:$('#play_toggle'),
        soundToggle:$('#sound_toggle'),
        shuffleToggle:$('#shuffle_toggle'),
        repeatToggle:$('#repeat_toggle'),
        playerModeToggle:$('#expand'),
        helpModeToggle:$('#help'),
        loadedMusicSlider:false,
        volumeSlider:$('#volume_slider'),
        musicSlider:$('#music_slider'),
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
            'click #help.off':'turnOnHelpMode',
            'click #volume_slider':'changedVolume',
            'click #music_slider':'changedMusicProgress'
        },
        initialize:function(){
            this.bind('audio:update',this.updateAudioProgress);
            _.bindAll(this,'togglePause','changedVolume','turnOnFullScreen','turnOffFullScreen',
                    'turnOnHelpMode','turnOffHelpMode','changedMusicProgress');
            this.audioEL = new ui.AudioElement({player:this});
            this.volumeSlider.attr('value',settings.getVolume());
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
                    max=parseFloat(this.musicSlider.attr('max'));
                console.log(newX,width,max);
                var newProgressValue=(newX/width*max);
                this.musicSlider.attr('value',newProgressValue);
                this.audioEL.setTime(newProgressValue);
            }
        },
        changedVolume:function(e){
            var newX=e.offsetX,
                width=this.volumeSlider.width(),
                percent = newX/width;
            //minor hack for possibility to make 100% loud
            if(percent>0.95)
            {
                percent=1;
            }
            this.audioEL.setVolume(percent);
            this.volumeSlider.attr('value',percent);
            settings.saveVolume(percent);
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
            var timeInSeconds = parseInt(currentTime, 10),
                songDuration = parseInt(duration,10),
                rem = parseInt(duration - currentTime, 10),
                pos = (timeInSeconds / duration) * 100,
                mins = Math.floor(currentTime/60,10),
                secs = timeInSeconds - mins*60,
                timeCounter = mins + ':' + (secs > 9 ? secs : '0' + secs),
                currentSong = AppController.playlistView.currentSong();
            if(rem==0){
                this.loadedMusicSlider=false;
                dataService.scrobble(currentSong.get('title'),currentSong.get('artist'),timeInSeconds);
                this.next();

            }
            this.timeCounter.text(timeCounter);
            this.musicSlider.attr('value',currentTime);

            if (!this.loadedMusicSlider){
                this.loadedMusicSlider = true;
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