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
            'keyup input':'keyPresed'
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
        keyPressed:function(event)
        {
            var keyCode = event.keyCod,currentSong=undefined;
            if(keyCode==13){
                this.filterLibrary();
            }
        },
        allArtistsLoaded:function(){
            var lastArtist=settings.getLastArtist();
            if(lastArtist){
                var lastPlayedArtist = this.artists.findByName(lastArtist);
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
            if(artist.get('name')){
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
            var album = e.currentTarget.dataset.album;
            var albumSongs=this.model.songs.filter(function(song){return song.get('album')==album;});
            AppController.songsView.songs.refresh(albumSongs);
            AppController.playlistView.setSongsAndPlay(albumSongs);
        },
        deleteArtist:function(){
            this.model.destroy();
            this.$(this.el).remove();
        },
        selectAlbum:function(e){
            var album = e.currentTarget.dataset.album;
            var albumSongs=this.model.songs.filter(function(song){return song.get('album')==album;});
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