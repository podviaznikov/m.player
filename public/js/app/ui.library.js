"use strict";
$(function(){
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
            this.artists=new ArtistsList();//should be first in this method!
            this.playLists=new PlayLists();//should be first in this method!
            this.albums=new AlbumList();
            this.soundCloudTracks=new SoundCloudTrackList();
            _.bindAll(this,'addArtist', 'addPlayList','addPlayLists','addAlbum','addSoundCloudTrack','addSoundCloudTracks',
                'showArtists','showPlayLists','showAlbums','showSoundCloud',
                'allArtistsLoaded','filterLibrary','keyPressed','showSoundCloudMenu');
            this.artists.bind('add',this.addArtist);
            this.artists.bind('retrieved',this.allArtistsLoaded);
            this.playLists.bind('add',this.addPlayList);
            this.playLists.bind('refresh',this.addPlayLists);
            this.soundCloudTracks.bind('add',this.addSoundCloudTrack);
            this.soundCloudTracks.bind('refresh',this.addSoundCloudTracks);
            this.artists.fetch();
            this.playLists.fetch();
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
            this.artistsContent.show();
            this.albumsContent.hide();
            this.playListsContent.hide();
            this.soundCloudContent.hide();
        },
        showAlbums:function(){
            this.albumsContent.show();
            this.artistsContent.hide();
            this.playListsContent.hide();
            this.soundCloudContent.hide();
        },
        showPlayLists:function(){
            this.playListsContent.show();
            this.artistsContent.hide();
            this.albumsContent.hide();
            this.soundCloudContent.hide();
        },
        showSoundCloud:function(){
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
        //not binded to this because used in addArtist
        addAlbums:function(albums){
            albums.each(this.addAlbum);
        },
        addArtist:function(artist){
            //do not show view if artist has no name
            var self=this;
            if(artist.get('name') && !artist.get('isDeleted')){
                artist.albumsModels.bind('refresh',function(){
                    self.addAlbums(this);
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
            var filterValue=this.searchField.val();
            if(!filterValue || filterValue===''){
                this.artists.each(function(artist){
                    if(artist.view){
                        artist.view.show();
                    }
                });
            }
            else{
                this.artists.each(function(artist){
                    if(_.contains(artist.get('name'),filterValue)){
                        if(artist.view){
                            artist.view.show();
                        }
                    }
                    else{
                        if(artist.view){
                            artist.view.hide();
                        }
                    }
                });
            }
        }
    });

    ui.ArtistMenuView=Backbone.View.extend({
        className:'lib-item-data box',
        tagName:'article',
        tpl:$('#artist_tpl').html(),
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
            _.bindAll(this,'render','selectArtist','playArtistSongs','hide','show',
                    'deleteArtist','selectAlbum','playAlbumSongs','showArtistBio','handleDragStart');
            this.model.songs.bind('all',this.render);
            this.model.bind('change',this.render);
            this.model.view=this;
        },
        render:function(){
            var html = _.template(this.tpl,{
                image:this.model.get('image'),
                name:this.model.get('name'),
                albums:this.model.get('albums'),
                genres:this.model.get('genres'),
                songsCount:this.model.get('songsCount')
            });
            this.el.draggable=true;
            this.el.dataset.artist=this.model.get('name');
            $(this.el).html(html);
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
            AppController.detailsView.songs.refresh(albumSongs);
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
        },
        hide:function(){
            this.$(this.el).hide();
        },
        show:function(){
            this.$(this.el).show();
        }
    });

    ui.AlbumMenuView=Backbone.View.extend({
        className:'lib-item-data box',
        tagName:'article',
        tpl:$('#album_lib_tpl').html(),
        events:{
            'click':'selectAlbum',
            'dblclick':'playAlbumSongs',
        },
        initialize:function(){
            _.bindAll(this,'render','renderAlbumInfo','selectAlbum','playAlbumSongs');
            this.model.bind('change',this.render);
            this.model.bind('add',this.render);
            this.model.view=this;
        },
        render:function(){
            this.model.findImage(this.renderAlbumInfo);
            return this;
        },
        renderAlbumInfo:function(image){
            var html=_.template(this.tpl,{
                image:image,
                name:this.model.get('name'),
                artist:this.model.get('artist'),
                songsCount:this.model.get('songs').length
            });
            $(this.el).html(html);
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
        tpl:$('#saved_playlist_tpl').html(),
        events:{
            'click':'selectPlayList',
            'dblclick':'playPlayList',
            'click .delete_playlist':'deletePlaylist'
        },
        initialize:function(){
            _.bindAll(this,'render','renderPlayListInfo','selectPlayList','playPlayList','deletePlaylist');
            this.model.bind('change',this.render);
            this.model.view=this;
        },
        render:function(){
            this.model.findImage(this.renderPlayListInfo);
            return this;
        },
        renderPlayListInfo:function(image){
            var html=_.template(this.tpl,{
                image:image,
                name:this.model.get('name'),
                genres:this.model.findGenres(),
                songsCount:this.model.get('songs').length
            });
            $(this.el).html(html);
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
        tpl:$('#sound_cloud_track_menu_tpl').html(),
        render:function(){
            var html=_.template(this.tpl,{
                name:this.model.get('name'),
            });
            $(this.el).html(html);
            return this;
        }
    });
});