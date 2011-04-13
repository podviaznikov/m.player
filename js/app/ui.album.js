// m.Player
// (c) 2011 Anton Podviaznikov, Enginimation Studio (http://enginimation.info).
// m.player may be freely distributed under the MIT license.
// For all details and documentation:
// https://github.com/podviaznikov/m.player
"use strict";
var global = window;
$(function()
{
    ui.AlbumView = Backbone.View.extend({
        className: 'album_full_info_panel',
        tagName: 'article',

        initialize: function()
        {
            _.bindAll(this, 'addSong','render');
        },
        render:function()
        {
            var self=this;
            this.albumInfoView = new ui.AlbumInfoView({model:this.model});
            $(this.el).append(this.albumInfoView.render().el);
            _.each(this.model.songs,function(song,key)
            {
                self.addSong(song,key);
            });
            return this;
        },

        addSong: function(song,key)
        {
            var view = new ui.SongView({model:song,key:key,songs:this.model.songs});
            song.view = view;
            $(this.el).append(view.render().el);
        }
    });

    ui.AlbumInfoView = Backbone.View.extend({
        className: 'detailed_album_info_panel box',
        tagName: 'section',
        tpl:$('#detailed_album_info_tpl').html(),

        initialize: function()
        {
            _.bindAll(this,'renderAlbumInfo','render');
        },
        renderAlbumInfo:function(data)
        {
            var html = _.template(this.tpl,
            {
                image:data.image,
                name:data.name,
                releaseDate:data.releaseDate,
                songsCount:data.songsCount
            });
            $(this.el).append(html);
        },
        render:function()
        {
            lastFM.getAlbumInfo(this.model.artist,this.model.album,this.renderAlbumInfo);
            return this;
        }
    });


    ui.SongView = Backbone.View.extend({
        className:'song-data',
        tpl:$('#song_tpl').html(),
        events:
        {
            'click .song':'selectSong',
            'dblclick .song':'selectForPlaying',
            'click .delete_song': 'deleteSong'
        },
        initialize:function()
        {
            _.bindAll(this,'selectSong','selectForPlaying','render');
        },

        render: function()
        {
            this.el.draggable=true;
            this.el.dataset.songname=this.model.get('title');
            this.el.dataset.id=this.model.id;
            this.el.id=this.model.id;
            var html = _.template(this.tpl,
            {
                track:this.model.get('track')||this.options.key+1,
                title:this.model.get('title')
            });
            $(this.el).html(html);
            return this;
        },
        selectSong: function()
        {
            $('.song-data').removeClass('selected_song');
            $(this.el).addClass('selected_song');
        },
        selectForPlaying:function()
        {
            this.selectSong();
            var album=this.model.get('album');
            var artist=this.model.get('artist');
            var albumSongs=this.options.songs;
            AppController.playlistView.songs.refresh(albumSongs);

            settings.saveLastAlbum(album);
            settings.saveLastArtist(artist);
            settings.savePlayList(albumSongs);
        }
    });

});
