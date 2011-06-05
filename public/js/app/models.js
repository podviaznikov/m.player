"use strict";
var Song = Porridge.Model.extend({
    defaults:{
        album:'No information',
        title:'No information',
        artist:'No information',
        year:'',
        genre:''
    }
},{
    definition:{
        name:'song',
        key:'id',
        indexes:[{name:'artists',field:'artist'}]
    }
});
var SongsList = Porridge.Collection.extend({
    model:Song,
    comparator:function(song){
        var track = song.get('track');
        if(track && track!='')
        {
            return parseInt(track);
        }
        return song.get('name');
    },
    forAlbum:function(album)
    {
        return this.filter(function(song){return song.get('album')===album;});
    }
});
var Artist = Porridge.Model.extend({
    initialize:function(){
        _.bindAll(this,'setParameterFromSongs');
        if(!this.get('id')){
            this.id=UUID.generate();
            this.set({id:this.id});
        }
        this.songs=new SongsList;
        this.songs.bind('retrieved',this.setParameterFromSongs);
        this.songs.fetchByKey('artists',this.get('name'));
    },
    setParameterFromSongs:function(){
        var albums=_.uniq(this.songs.pluck('album')),
            genres=_.uniq(this.songs.pluck('genre')),
            songsCount = this.songs.length;
        this.set({albums:albums,genres:genres,songsCount:songsCount});
    }
},{
    definition:{
        name:'artist',
        key:'name'
    }
});
var ArtistsList = Porridge.Collection.extend({
    model:Artist,
    forName:function(artistName){
        return this.find(function(artist){ return artist.get('name') === artistName; });
    },
    comparator:function(song){return song.get('name');}
});

var PlayList = Porridge.Model.extend({
//    getGenres:function()
//    {
//        var songs=this.get('songs');
//        var genres=_.map(songs, function(song){ return song.genre; });
//        return _.uniq(genres);
//    }
},{
    definition:{
        name:'playlist',
        key:'id'
    }
});
var PlayLists = Porridge.Collection.extend({model: PlayList});