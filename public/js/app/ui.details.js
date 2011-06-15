"use strict";
$(function(){

    //2nd column view
    ui.DetailsView = Backbone.View.extend({
        el:$('#filtered_lib'),
        libDetailsPanel:$('#filtered_lib_content'),
        artistBioPanel:$('#artist_bio'),
        events:{
            'dragstart':'handleDragStart'
        },
        initialize:function(){
            _.bindAll(this, 'showAlbums','showPlayList','handleDragStart','showBio','hideBio');
            this.mapping={};
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
        showAlbums:function(albums,artist,songs){
            this.hideBio();
            this.songs=songs;
            if(albums){
                for(var i=0;i<albums.length;i++){
                    var album=albums[i],
                        albumSongs=songs.forAlbum(album),
                        albumView=new ui.AlbumView({model:{album:album,artist:artist,songs:albumSongs}});
                    this.mapping[album]=albumSongs;
                    this.libDetailsPanel.append(albumView.render().el);
                }
            }
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

    ui.ArtistBioView = Backbone.View.extend({
        el: $('#artist_bio'),
         initialize:function(){
            _.bindAll(this,'render','setArtistModel','renderArtistBio','clear');
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
            var html=unescape(data.summary);
            $(this.el).html(html);
         },
         clear:function(){
            $(this.el).html('');
         }
    });

    ui.AlbumView = Backbone.View.extend({
        className:'lib_item_full_info_panel',
        tagName:'article',
        initialize: function(){
            _.bindAll(this, 'addSong','render');
        },
        render:function(){
            this.albumInfoView=new ui.AlbumInfoView({model:this.model});
            $(this.el).append(this.albumInfoView.render().el);
            _.each(this.model.songs,this.addSong);
            return this;
        },
        addSong:function(song,key){
            var view=new ui.SongView({model:song,key:key,songs:this.model.songs});
            song.albumView = view;
            $(this.el).append(view.render().el);
        }
    });

    ui.PlayListFullView = Backbone.View.extend({
        className:'lib_item_full_info_panel',
        tagName:'article',
        tpl:$('#detailed_playlist_info_tpl').html(),
        events:{
            'click':'playSongs'
        },
        initialize: function(){
            _.bindAll(this, 'addSong','render','renderPlayListInfo','playSongs');
        },
        render:function(){
            this.model.findImage(this.renderPlayListInfo);
            _.each(this.model.get('songs'),this.addSong);
            return this;
        },
        renderPlayListInfo:function(image){
            var html=_.template(this.tpl,{
              image:image,
              name:this.model.get('name')
            });
            $(this.el).append(html);
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
            var html=_.template(this.tpl,{
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
            var html=_.template(this.tpl,{
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
            }else{
                AppController.playlistView.removePlayListModel();
            }
        }
    });
});