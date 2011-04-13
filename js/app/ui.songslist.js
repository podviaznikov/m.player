// m.Player
// (c) 2011 Anton Podviaznikov, Enginimation Studio (http://enginimation.info).
// m.player may be freely distributed under the MIT license.
// For all details and documentation:
// https://github.com/podviaznikov/m.player
"use strict";
var global = window;
$(function()
{
    ui.SongsView = Backbone.View.extend(
    {
        el:$('#filtered_lib'),
        filteredLibContent:$('#filtered_lib_content'),

        initialize: function()
        {
            _.bindAll(this, 'showAlbums');
            this.mapping={};
        },

        showAlbums: function(albums,artist,songs)
        {
            var self=this;
            this.filteredLibContent.empty();
            for(var i=0;i<albums.length;i++)
            {
                var album=albums[i];
                var albumSongs=songs.filter(function(song){return song.get('album')===album;});
                this.mapping[album]=albumSongs;
                var albumView = new ui.AlbumView({model:{album:album,artist:artist,songs:albumSongs}});
                this.filteredLibContent.append(albumView.render().el);
            }
        }
    });

});
