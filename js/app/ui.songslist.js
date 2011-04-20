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
        events:
        {
            'dragstart':'handleDragStart'
        },
        initialize: function()
        {
            _.bindAll(this, 'showAlbums','handleDragStart');
            this.mapping={};
        },

        showAlbums: function(albums,artist,songs)
        {
            this.filteredLibContent.empty();
            this.songs=songs;
            for(var i=0;i<albums.length;i++)
            {
                var album=albums[i];
                var albumSongs=songs.filter(function(song){return song.get('album')===album;});
                this.mapping[album]=albumSongs;
                var albumView = new ui.AlbumView({model:{album:album,artist:artist,songs:albumSongs}});
                this.filteredLibContent.append(albumView.render().el);
            }
        },
        handleDragStart:function(e)
        {
            var event=e.originalEvent;
            var dataTransferObj=event.dataTransfer;
            dataTransferObj.effectAllowed = 'move';
            var songId=event.srcElement.dataset['id'];
            var song = this.songs.get(songId);
            dataTransferObj.setData('text/plain', JSON.stringify(song.toJSON()));
        }
    });

});
