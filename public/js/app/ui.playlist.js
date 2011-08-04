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