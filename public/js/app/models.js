"use strict";
var DataTransfer={
    create:function(type,value){
        return Object.create(this,{type:{value:type},value:{value:value}});
    },
    toString:function(){
        return JSON.stringify({
            type:this.type,
            value:this.value
        });
    },
    fromString:function(source){
        return JSON.parse(source);
    }
};
var Song = Porridge.Model.extend({
    defaults:{
        album:'No information',
        title:'No information',
        artist:'No information',
        year:'',
        genre:''
    },
    remove:function(){
        //destroy model
        this.destroy();
        //remove file from filesystem
        fs.util.remove(this.get('fileName'));
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
    //sort by track number or name if track number is not presented
    comparator:function(song){
        var track = song.get('track');
        if(track && track!=''){
            //should always pass 10. In other case '08'(as example) may be parsed incorrectly
            return parseInt(track,10);
        }
        return song.get('name');
    },
    forAlbum:function(album){
        return this.filter(function(song){return song.get('album')===album;});
    },
    remove:function(){
        this.each(function(song){
            song.remove();
        });
    }
});
var Artist = Porridge.Model.extend({
    defaults:{
        isDeleted:false
    },
    initialize:function(){
        _.bindAll(this,'setParameterFromSongs','refresh','remove');
        if(!this.get('id')){
            this.id=UUID.generate();
            this.set({id:this.id});
        }
        this.songs=new SongsList;
        this.songs.bind('retrieved',this.setParameterFromSongs);
        this.bind('change',this.refresh);
    },
    refresh:function(){
        this.songs.fetchByKey('artists',this.get('name'));
    },
    setParameterFromSongs:function(){
        var albums=_.uniq(this.songs.pluck('album')),
            genres=_.uniq(this.songs.pluck('genre')),
            songsCount = this.songs.length;
        this.set({albums:albums,genres:genres,songsCount:songsCount});
        if(songsCount===0){
            this.set({isDeleted:true});
        }
    },
    remove:function(){
        this.set({isDeleted:true});
        this.songs.remove();
        this.model.save();
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