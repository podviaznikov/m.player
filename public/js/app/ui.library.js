// m.player
// (c) 2011 Enginimation Studio (http://enginimation.com).
// m.player may be freely distributed under the MIT license.
// For all details and documentation:
// https://github.com/podviaznikov/m.player
"use strict";
var global = window;
$(function()
{
    ui.LibraryMenu = Backbone.View.extend(
    {
        el: $('#library_menu'),
        artistsContent: $('#artists_library_content'),
        playListsContent: $('#playlists_library_content'),

        events:
        {
            'click #show_artists':'showArtists',
            'click #show_playlists':'showPlayLists'
        },
        initialize:function()
        {
            var self=this;
            this.artists=new ArtistsList;//should be first in this method!
            this.playLists=new PlayLists;//should be first in this method!
            _.bindAll(this, 'addArtist', 'addPlayList','addPlayLists','showArtists','showPlayLists','allArtistsLoaded');
            this.artists.bind('add',this.addArtist);
            this.artists.bind('retrieved',this.allArtistsLoaded);
            this.playLists.bind('add',this.addPlayList);
            this.playLists.bind('refresh',this.addPlayLists);

            this.artists.fetch();

            this.playLists.fetch();
        },
        allArtistsLoaded:function()
        {
            var lastArtist=settings.getLastArtist();
            if(lastArtist)
            {
                var lastPlayedArtist = this.artists.findByName(lastArtist);
                if(lastPlayedArtist && lastPlayedArtist.view)
                {
                    lastPlayedArtist.view.selectArtist();
                }
            }
        },
        showArtists:function()
        {
            this.artistsContent.show();
            this.playListsContent.hide();
        },
        showPlayLists:function()
        {
            this.artistsContent.hide();
            this.playListsContent.show();
        },
        addArtist: function(artist)
        {
            if(artist.get('name'))
            {
                var view = new ui.ArtistMenuView({model:artist});
                artist.view=view;
                this.artistsContent.append(view.render().el);
            }
        },
        addPlayList:function(playList)
        {
            var view = new ui.PlayListMenuView({model:playList});
            this.playListsContent.append(view.render().el);
        },
        addPlayLists:function()
        {
            this.playLists.each(this.addPlayList);
        }
    });
});
