// m.Player
// (c) 2011 Anton Podviaznikov, Enginimation Studio (http://enginimation.info).
// m.player may be freely distributed under the MIT license.
// For all details and documentation:
// https://github.com/podviaznikov/m.player
"use strict";
var Song = Porridge.Model.extend(
{
    defaults:
    {
        album:'no album',
        title:'no title',
        artist:'no artist',
        year:'',
        genre:'no genre'
    }
},
{
    definition:
    {
        name:'song',
        key:'id',
        indexes:[{name:'artists',field:'artist'}]
    }
});
var SongsList = Porridge.Collection.extend(
{
    model: Song,
    comparator: function(song)
    {
        return song.get('track');
    }
});
var Artist = Porridge.Model.extend(
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
        this.songs.bind('retrieved',this.setParameterFromSongs);
        this.songs.fetchByKey('artists',this.get('name'));
    },

    setParameterFromSongs:function()
    {
        var albums = _.uniq(this.songs.pluck('album'));
        var genres = _.uniq(this.songs.pluck('genre'));
        var songsCount = this.songs.length;
        this.set({albums:albums,genres:genres,songsCount:songsCount});
    }
},
{
    definition:
    {
        name:'artist',
        key:'name'
    }
});

var ArtistsList = Porridge.Collection.extend(
{
    model: Artist,

    findByName:function(artistName)
    {
        return this.find(function(artist){ return artist.get('name') == artistName; });
    }
});

var PlayList = Porridge.Model.extend(
{
//    getGenres:function()
//    {
//        var songs=this.get('songs');
//        var genres=_.map(songs, function(song){ return song.genre; });
//        return _.uniq(genres);
//    }
//    initialize:function(attrs)
//    {
//        var songsList=[];
//        //_.each(attrs.songs,function(song,key)
////        {
////            songsList[key]=new Song({attributes:song});
////        });
////        this.set({songsList:new SongsList(songsList)});
//    }
},
{
    definition:
    {
        name:'playlist',
        key:'name'
    }
});
var PlayLists = Porridge.Collection.extend(
{
    model: PlayList
});
