// m.Player
// (c) 2011 Anton Podviaznikov, Enginimation Studio (http://enginimation.info).
// m.player may be freely distributed under the MIT license.
// For all details and documentation:
// https://github.com/podviaznikov/m.player
"use strict";
var Song = Backbone.Model.extend(
{
    initialize:function()
    {
        if(!this.get('id'))
        {
            this.id=UUID.generate();
            this.set({id:this.id});
        }
    }
});
var SongsList = Backbone.Collection.extend({

    model: Song,

    comparator: function(song)
    {
        return song.get('track');
    },

    fetch: function(method,allLoaded)
    {
        var collection = this;
        var handleSongLoad = function(model)
        {
            collection._add(model);//todo anton question regarding internal and public method. look one more time
        };
        if(method)
        {
            method(handleSongLoad,allLoaded);
        }
        else
        {
            musicDao.getAllSongs(handleSongLoad,allLoaded);
        }
        return this;
    }
});
var Artist = Backbone.Model.extend(
{
    initialize:function()
    {
        if(!this.get('id'))
        {
            this.id=UUID.generate();
            this.set({id:this.id});
        }
        this.songs = new SongsList;
        var self = this;
        this.songs.fetch(function(handleSongLoad,allLoaded)
        {
            musicDao.getAllArtistSongs(self.get('name'),handleSongLoad,allLoaded);
        },
        function()
        {
            var albums = _.uniq(self.songs.pluck('album'));
            var genres = _.uniq(self.songs.pluck('genre'));
            var songsCount = self.songs.length;
            self.set({albums:albums,genres:genres,songsCount:songsCount});
        });
    }
});

var ArtistsList = Backbone.Collection.extend({

    model: Artist,

    fetch: function(allLoaded)
    {
        var collection = this;
        var handleArtistLoad = function(model)
        {
            collection._add(model);
        };
        musicDao.getAllArtists(handleArtistLoad,allLoaded);
        return this;
    },

    findByName:function(artistName)
    {
        return this.find(function(artist){ return artist.get('name') == artistName; });
    }
});

