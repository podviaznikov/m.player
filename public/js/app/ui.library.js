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
            //this.playLists.fetch();
            //this.soundCloudTracks.fetch();
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

