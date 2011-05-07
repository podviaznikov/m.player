// m.player
// (c) 2011 Enginimation Studio (http://enginimation.com).
// m.player may be freely distributed under the MIT license.
// For all details and documentation:
// https://github.com/podviaznikov/m.player
"use strict";
$(function()
{
    ui.PlayListView = Backbone.View.extend(
    {
        el:$('#playing_list'),
        infoEl:$('#playing_list #song_info_view'),
        songsEl:$('#playing_list #playing_songs'),
        dropFileLabel:$('#playing_list #playing_songs label'),
        statEL:$('#playing_list footer'),
        songInfoTpl: $('#song_info_tpl').html(),
        playlistStatTpl: $('#playlist_stat_tpl').html(),
        newPlayListName:$('#new_play_list'),
        events:
        {
            'dragover':'dragOverFiles',
            'drop':'dropFiles',
            'blur #new_play_list':'savePlayList',
            'click #clear_playlist':'clearPlaylist'
        },
        initialize: function()
        {
            this.songs=new SongsList;//should be first in this method!
            _.bindAll(this, 'addOne', 'addAll','createFileURL','destroyFileURL','currentSong',
             'randomSong','renderAlbumInfo','render','handleFileSelect','clearPlaylist',
              'playSongModel','savePlayList','setPlayListModel','removePlayListModel','processAudioFile');
            this.bind('song:select',this.selectSong);
            this.bind('url:create',this.createdFileURL);
            this.songs.bind('add',this.addOne);
            this.songs.bind('refresh',this.addAll);
            this.songs.bind('all',this.render);
            var playlist=settings.getPlayList();
            if(playlist)
            {
                this.songs.refresh(playlist.models);
                var lastSong=settings.getLastSong();
                if(lastSong)
                {
                    this.selectSong(new Song(lastSong));
                }
            }
        },
        render:function()
        {
            this.statEL.html(_.template(this.playlistStatTpl,{songsCount:this.songs.length}));
            return this;
        },
        setPlayListModel:function(playList)
        {
            this.playList = playList;
            this.newPlayListName.val(this.playList.get('name'));
        },
        removePlayListModel:function()
        {
            this.playList = null;
            this.newPlayListName.val('Unsaved list');
        },
        savePlayList:function()
        {
            var newPlaylistName=this.newPlayListName.val();
            if(newPlaylistName!='Unsaved list')
            {
                if(!this.playList)
                {
                    this.playList=new PlayList();
                }
                var songs=this.songs.toJSON();
                this.playList.set({name:newPlaylistName,songs:songs});
                this.playList.save();
                AppController.libraryMenu.playLists.add(this.playList);
            }
        },
        clearPlaylist:function()
        {
            this.songsEl.empty();
            this.songs.refresh([]);
            settings.savePlayList(this.songs);
            this.render();
        },
        addOne:function(song)
        {
            if(song.get('fileName'))
            {
                this.dropFileLabel.remove();
                var view = new ui.SongMiniView({model:song,playlist:this});
                song.view = view;
                this.songsEl.append(view.render().el);
            }
        },
        addAll:function()
        {
            if(this.songs.length!=0)
            {
                this.songsEl.empty();
                this.songs.each(this.addOne);
            }
        },
        dragOverFiles:function(e)
        {
            e.stopPropagation();
            e.preventDefault();
        },
        dropFiles:function(e)
        {
            e.stopPropagation();
            e.preventDefault();
            var dataTransfer=e.originalEvent.dataTransfer;
            var files=dataTransfer.files;
            if(files && files.length>0)
            {
                this.handleFileSelect(e.originalEvent.dataTransfer.files); // handle FileList object.
            }
            else
            {
                var songJSON=JSON.parse(dataTransfer.getData('text/plain'));
                var song = new Song(songJSON);
                this.songs.add(song);
            }
        },
        selectSong:function(song)
        {
            this.selectedSong=song;
            lastFM.getAlbumImage(this.selectedSong.get('artist'),this.selectedSong.get('album'),this.renderAlbumInfo);
        },
        renderAlbumInfo:function(image)
        {
            this.infoEl.html(_.template(this.songInfoTpl,
            {
                image:image,
                name:this.selectedSong.get('title'),
                artist:this.selectedSong.get('artist'),
                album:this.selectedSong.get('album'),
                year:this.selectedSong.get('year')
            }));
        },
        createdFileURL:function(url)
        {
            this.fileURL=url;
        },
        destroyFileURL:function()
        {
            if(this.fileURL)
            {
                fs.util.destroyFileURL(this.fileURL);
            }
        },
        randomSong:function()
        {
            var randomSong=Math.floor(Math.random()*this.songs.length);
            if(randomSong==this.currentSong())
            {
                return this.randomSong();
            }
            return randomSong;
        },
        currentSong:function()
        {
            return this.songs.at(this.currentSongIndex());
        },
        currentSongIndex:function()
        {
            return this.songs.indexOf(this.selectedSong);
        },
        next:function(playSongFlag)
        {
            var playSong=playSongFlag==false? false : true;
            var nextSongId = -1;
            if(playSong && settings.isShuffle())
            {
                nextSongId=this.randomSong();
            }
            else
            {
                var indexOfSelectedSong=this.currentSongIndex();
                if(indexOfSelectedSong==this.songs.length-1)
                {
                    indexOfSelectedSong=-1;//to have first one
                    if(!settings.isRepeat())
                    {
                        playSong=false;
                    }
                }
                nextSongId=indexOfSelectedSong+1;
            }
            var nextSong=this.songs.at(nextSongId);
            this.playSongModel(nextSong,playSong);
        },
        previous:function(playSongFlag)
        {
            var playSong=playSongFlag==false? false : true;
            var indexOfSelectedSong=this.currentSongIndex();
            if(indexOfSelectedSong==0)
            {
                indexOfSelectedSong=this.songs.length;//to have last one
            }
            var previousSong=this.songs.at(indexOfSelectedSong-1);
            this.playSongModel(previousSong,playSong);
        },
        playSongModel:function(song,playSong)
        {
            if(playSong)
            {
                this.destroyFileURL();
                if(song && song.view)
                {
                    song.view.playSong();
                }
            }
            else if(!playSong && song && song.view)
            {
                song.view.selectSong();
            }
        },
        handleFileSelect:function(files)
        {
            var audioFiles=_.select(files, function(file){return file.type.match('audio/mp3')});
            _.each(audioFiles,this.processAudioFile);
        },
        processAudioFile:function(file)
        {
            fs.read.fileAsBinaryString(file, function(readError,data,initialFile)
            {
                if(readError)
                {
                    return;
                }
                var initialFile = initialFile;
                ID3v2.parseFile(data,function(tags)
                {
                    var songData = tags;
                    var song = new Song();

                    var uniqueFileName=song.id+initialFile.extension();

                    songData.fileName=uniqueFileName;
                    songData.originalFileName=initialFile.name;
                    song.set(songData);

                    //save file
                    fs.write.file(initialFile,function(writeError)
                    {
                        if(!writeError)
                        {
                            song.save();
                            var artistName = song.get('artist');
                            var artist=AppController.libraryMenu.artists.findByName(artistName);
                            if(!artist)
                            {
                                artist = new Artist({name:song.get('artist')});
                                lastFM.getArtistImage(artist.get('name'),function(image)
                                {
                                    artist.set({image:image});
                                    artist.save();
                                    AppController.libraryMenu.artists.add(artist);
                                });
                            }
                            AppController.playlistView.songs.add(song);
                        }
                    },uniqueFileName);
               });
            });
        }
    });

    ui.SongMiniView = Backbone.View.extend(
    {
        className:'song-data',
        tpl:$('#song_mini_tpl').html(),
        events:
        {
            'click .song':'selectSong',
            'dblclick .song':'playSong'
        },
        initialize:function()
        {
            _.bindAll(this,'render','selectSong','playSong','deleteSong','songFileLoaded');
        },
        render: function()
        {
            this.el.draggable=true;
            this.el.dataset.filename=this.model.get('fileName');
            this.el.dataset.songname=this.model.get('title');
            this.el.dataset.id=this.model.id;
            this.el.id=this.model.id;
            var html = _.template(this.tpl,
            {
                track:this.model.get('track'),
                title:this.model.get('title'),
                album:this.model.get('album'),
                year:this.model.get('year')
            });
            $(this.el).html(html);
            return this;
        },
        selectSong:function()
        {
            $('.song-data').removeClass('selected_song');
            $(this.el).addClass('selected_song');
            this.options.playlist.trigger('song:select',this.model);
            AppController.visualizationView.selectSong(this.model);
        },
        playSong:function()
        {
            settings.saveLastSong(this.model.toJSON());
            this.selectSong();
            var songFileName=this.el.dataset.filename;
            fs.util.createFileURL(songFileName,this.songFileLoaded);
        },
        songFileLoaded:function(url)
        {
            this.options.playlist.trigger('url:create',url);
            AppController.playerCtrl.play(url);
        }
    });

});
