// m.player
// (c) 2011 Enginimation Studio (http://enginimation.com).
// m.player may be freely distributed under the MIT license.
// For all details and documentation:
// https://github.com/podviaznikov/m.player
"use strict";
$(function()
{
    ui.AlbumView = Backbone.View.extend(
    {
        className: 'lib_item_full_info_panel',
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

    ui.PlayListFullView = Backbone.View.extend(
    {
        className: 'lib_item_full_info_panel',
        tagName: 'article',
        tpl:$('#detailed_playlist_info_tpl').html(),
        events:
        {
            'click':'playSongs'
        },
        initialize: function()
        {
            _.bindAll(this, 'addSong','render','playSongs');
        },
        render:function()
        {
            var html = _.template(this.tpl,
            {
                image:'css/images/no_picture.png',
                name:this.model.get('name')
            });
            $(this.el).append(html);
            this.model.get('songs').each(this.addSong);
            return this;
        },
        addSong:function(song,key)
        {
            var song=new Song(song);
            var view = new ui.SongView(
            {
                model:song,
                key:key,
                songs:this.model.get('songs'),
                playList:this.model
            });
            song.albumView = view;
            $(this.el).append(view.render().el);
        },
        playSongs:function()
        {
            AppController.playlistView.setSongsAndPlay(this.model.get('songs').models);
        }
    });

    ui.AlbumInfoView = Backbone.View.extend(
    {
        className: 'detailed_album_info_panel box',
        tagName: 'section',
        tpl:$('#detailed_album_info_tpl').html(),
        events:
        {
            'click':'playSongs'
        },
        initialize:function()
        {
            _.bindAll(this,'renderAlbumInfo','render','playSongs');
        },
        renderAlbumInfo:function(data)
        {
            var html = _.template(this.tpl,
            {
                image:data.image,
                name:data.name,
                releaseDate:data.releaseDate
            });
            $(this.el).append(html);
        },
        render:function()
        {
            lastFM.getAlbumInfo(this.model.artist,this.model.album,this.renderAlbumInfo);
            return this;
        },
        playSongs:function()
        {
            AppController.playlistView.setSongsAndPlay(this.model.songs);
        }
    });

    ui.SongView = Backbone.View.extend(
    {
        className:'song-data',
        tpl:$('#song_tpl').html(),
        events:
        {
            'click':'selectSong',
            'click .delete_album_song':'deleteSong',
            'dblclick .song':'playSongs',
            'click .delete_song': 'deleteSong'
        },
        initialize:function()
        {
            _.bindAll(this,'selectSong','deleteSong','onDeleteSong','playSongs','render');
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
        deleteSong:function()
        {
            this.model.bind('destroy',this.onDeleteSong)
            this.model.destroy();
        },
        onDeleteSong:function()
        {
            this.model.albumView.remove();
            fs.util.remove(this.model.get('originalFileName'));
        },
        playSongs:function()
        {
            this.selectSong();
            var songs=this.options.songs;
            AppController.playlistView.setSongsAndPlay(songs);
            if(this.options.playList)
            {
                AppController.playlistView.setPlayListModel(this.options.playList);
            }
            else
            {
                AppController.playlistView.removePlayListModel();
            }
            settings.saveLastAlbum(this.model.get('album'));
            settings.saveLastArtist(this.model.get('artist'));
            settings.savePlayList(songs);
        }
    });

});
