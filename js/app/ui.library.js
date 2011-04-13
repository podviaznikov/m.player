// m.Player
// (c) 2011 Anton Podviaznikov, Enginimation Studio (http://enginimation.info).
// m.player may be freely distributed under the MIT license.
// For all details and documentation:
// https://github.com/podviaznikov/m.player
"use strict";
var global = window;
$(function()
{
    ui.LibraryMenu = Backbone.View.extend({
        el: $('#library_menu'),
        libraryContent: $('#library_content'),

        initialize:function()
        {
            var self=this;
            this.artists=new ArtistsList;//should be first in this method!
            _.bindAll(this, 'addOne', 'addAll', 'render');
            this.artists.bind('add',this.addOne);
            this.artists.bind('refresh',this.addAll);
            this.artists.bind('all',this.render);

            this.artists.fetch(function()
            {
                var lastArtist=settings.getLastArtist();
                if(lastArtist)
                {
                    var lastPlayedArtist = self.artists.findByName(lastArtist);
                    lastPlayedArtist.view.selectArtist();
                }
            });
        },

        render: function()
        {
           return this;
        },
        addOne: function(artist)
        {
            if(artist.get('name'))
            {
                var view = new ui.ArtistMenuView({model:artist});
                this.libraryContent.append(view.render().el);
            }
        }
    });
    ui.ArtistMenuView = Backbone.View.extend({
        className:'artist-data box',
        tagName: 'article',
        tpl:$('#artist_tpl').html(),
        events:
        {
            'click':'selectArtist',
            'click .album_link': 'selectAlbum'
        },
        initialize:function()
        {
            _.bindAll(this, 'addOne', 'addAll', 'render');
            this.model.songs.bind('all',this.render);
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
            $('.artist-data').removeClass('selected_artist');
            $(this.el).addClass('selected_artist');
            AppController.songsView.showAlbums(this.model.get('albums'),this.model.get('name'),this.model.songs);
        },

        selectAlbum:function(e)
        {
            var album = e.currentTarget.dataset.album;
            var albumSongs=this.model.songs.filter(function(song){return song.get('album')==album;});
            AppController.songsView.songs.refresh(albumSongs);
        }
    });
});
