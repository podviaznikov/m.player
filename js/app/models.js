// m.Player
// (c) 2011 Anton Podviaznikov, Enginimation Studio (http://enginimation.info).
// m.player may be freely distributed under the MIT license.
// For all details and documentation:
// https://github.com/podviaznikov/m.player
"use strict";
var Song = Backbone.Model.extend(
{
    defaults:
    {
        album:'no album',
        title:'no title',
        artist:'no artist',
        year:'no year',
        genre:'no genre'

    },
    initialize:function()
    {
        if(!this.get('id'))
        {
            this.id=UUID.generate();
            this.set({id:this.id});
        }
    }
});
var SongsList = Backbone.Collection.extend(
{
    model: Song,
    initialize:function()
    {
        _.bindAll(this,'handleSongLoad');
    },
    comparator: function(song)
    {
        return song.get('track');
    },

    handleSongLoad:function(model)
    {
        this.add(model);
    },
    fetch: function(name,allLoaded)
    {
        musicDao.getAllArtistSongs(name,this.handleSongLoad,allLoaded);
        return this;
    }
});
var Artist = Backbone.Model.extend(
{
    initialize:function()
    {
        _.bindAll(this,'setParameterFromSongs');
        if(!this.get('id'))
        {
            this.id=UUID.generate();
            this.set({id:this.id});
        }
        this.songs = new SongsList;
        this.songs.fetch(this.get('name'),this.setParameterFromSongs);
    },

    setParameterFromSongs:function()
    {
        var albums = _.uniq(this.songs.pluck('album'));
        var genres = _.uniq(this.songs.pluck('genre'));
        var songsCount = this.songs.length;
        this.set({albums:albums,genres:genres,songsCount:songsCount});
    }
});

var ArtistsList = Backbone.Collection.extend(
{
    model: Artist,

    fetch: function(allLoaded)
    {
        var collection = this;
        var handleArtistLoad = function(model)
        {
            collection.add(model);
        };
        musicDao.getAllArtists(handleArtistLoad,allLoaded);
        return this;
    },

    findByName:function(artistName)
    {
        return this.find(function(artist){ return artist.get('name') == artistName; });
    }
});

var PlayList = Backbone.Model.extend(
{
//    getGenres:function()
//    {
//        var songs=this.get('songs');
//        var genres=_.map(songs, function(song){ return song.genre; });
//        return _.uniq(genres);
//    }
});
var PlayLists = Backbone.Collection.extend(
{
    model: PlayList,
    localStorage: new Store("saved_playlists")
});
