"use strict";
$(function(){
    ui.PlayListView = Backbone.View.extend({
        el:$('#playing_list'),
        infoEl:$('#playing_list #song_info_view'),
        songsEl:$('#playing_list #playing_songs'),
        songInfoEl:$('#song_info'),
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
        handleDrop:function(e){
            e.stopPropagation();
            e.preventDefault();
            var dataTransfer=e.originalEvent.dataTransfer;
            if(dataTransfer&&dataTransfer.getData('text/plain')){
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
                    }else if('song'===transfer.type){
                        //we have song here. Add it to playlist
                        var song=new Song(transfer.value);
                        this.songs.add(song);
                    }
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
            //fixing max width for song info to prevent problems with big song names
            var playingListPanelWidth=$('#playing_list').width();
       		this.songInfoEl.css('max-width',playingListPanelWidth-115);
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
            var playSong=!playSongFlag,
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
