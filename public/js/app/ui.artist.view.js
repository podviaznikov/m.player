// m.player
// (c) 2011 Enginimation Studio (http://enginimation.com).
// m.player may be freely distributed under the MIT license.
// For all details and documentation:
// https://github.com/podviaznikov/m.player
"use strict";
var global = window;
$(function()
{
    ui.ArtistMenuView = Backbone.View.extend(
    {
        className:'lib-item-data box',
        tagName: 'article',
        tpl:$('#artist_tpl').html(),
        events:
        {
            'click':'selectArtist',
            'click .delete_artist':'deleteArtist',
            'click .album_link': 'selectAlbum'
        },
        initialize:function()
        {
            _.bindAll(this, 'addOne', 'addAll', 'render','selectArtist','deleteArtist','selectAlbum');
            this.model.songs.bind('all',this.render);
            this.model.bind('change',this.render);
            this.model.view=this;
        },
        render: function()
        {
            var html = _.template(this.tpl,
            {
                image:this.model.get('image'),
                name:this.model.get('name'),
                albums:this.model.get('albums'),
                genres:this.model.get('genres'),
                songsCount:this.model.get('songsCount')
            });
            $(this.el).html(html);

            return this;
        },

        selectArtist: function()
        {
            $('.lib-item-data').removeClass('selected-lib-item');
            $(this.el).addClass('selected-lib-item');
            AppController.songsView.showAlbums(this.model.get('albums'),this.model.get('name'),this.model.songs);
        },
        deleteArtist:function()
        {
            this.model.destroy();
            this.$(this.el).remove();
        },
        selectAlbum:function(e)
        {
            var album = e.currentTarget.dataset.album;
            var albumSongs=this.model.songs.filter(function(song){return song.get('album')==album;});
            AppController.songsView.songs.refresh(albumSongs);
        }
    });
});
