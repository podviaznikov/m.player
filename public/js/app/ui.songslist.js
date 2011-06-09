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
            song.albumView = view;
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
            this.model.remove();
        },
        onDeleteSong:function(){
            var view = this.model.albumView;
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
                    var album=albums[i],
                        albumSongs=songs.filter(function(song){return song.get('album')===album;}),
                        albumView=new ui.AlbumView({model:{album:album,artist:artist,songs:albumSongs}});
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
            dataTransferObj.effectAllowed='move';

            if(this.songs){
                var song=this.songs.get(songId),
                    dataTransfer=DataTransfer.create('song',song);
                dataTransferObj.setData('text/plain',dataTransfer.toString());
            }
        }
    });
});
