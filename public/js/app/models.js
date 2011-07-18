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
var Song=Porridge.Model.extend({
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
    },
    findImage:function(callback){
        var self=this;
        dataService.getAlbumImage(this.get('artist'),this.get('album'),function(image){
            self.set({image:image});
            callback();
        });
    }
},{
    definition:{
        name:'song',
        key:'id',
        indexes:[{name:'artists',field:'artist'}]
    }
});
var SongsList=Porridge.Collection.extend({
    model:Song,
    //sort by track number or name if track number is not presented
    comparator:function(song){
        var track=song.get('track');
        if(track && track!==''){
            //should always pass 10. In other case '08'(as example) may be parsed incorrectly
            return parseInt(track,10);
        }
        return song.get('name');
    },
    buildAlbumModel:function(album,artist){
        return new Album({name:album,artist:artist,songs:this.forAlbum(album)});
    },
    forAlbum:function(album){
        return this.filter(function(song){return song.get('album')===album;});
    },
    listOfAlbums:function(){
        return _.uniq(this.pluck('album'))||[];
    },
    listOfGenres:function(){
        return _.uniq(this.pluck('genre'))||[];
    },
    lisOfAlbumsModels:function(){
        var albums=new AlbumList();
        if(this.length>0){
            var artist=this.first().get('artist'),
                albumsArray=this.listOfAlbums(),
                self=this;
            _.each(albumsArray,function(album){
                var songs=self.forAlbum(album);
                albums.add(new Album({name:album,artist:artist,songs:new SongsList(songs)}));
            });
        }
        return albums;
    },
    remove:function(){
        this.each(function(song){
            song.remove();
        });
    }
});
var Artist=Porridge.Model.extend({
    defaults:{
        isDeleted:false
    },
    initialize:function(){
        _.bindAll(this,'setParameterFromSongs','remove');
        if(!this.get('id')){
            this.id=UUID.generate();
            this.set({id:this.id});
        }
        this.songs=new SongsList();
        this.albumsModels=new AlbumList();
        this.songs.bind('retrieved',this.setParameterFromSongs);
        this.songs.fetchByKey('artists',this.get('name'));
    },
    setParameterFromSongs:function(){
        var albums=this.songs.listOfAlbums(),
            genres=this.songs.listOfGenres(),
            songsCount=this.songs.length;
        this.set({albums:albums,genres:genres,songsCount:songsCount});
        if(songsCount===0){
            this.set({isDeleted:true});
        }
        //reset albums models
        this.albumsModels.reset(this.songs.lisOfAlbumsModels().models);
    },
    remove:function(){
        this.set({isDeleted:true});
        this.songs.remove();
        this.model.save();
    },
    findImage:function(callback){
        var self=this;
        dataService.getArtistImage(this.get('name'),function(image){
            self.set({image:image});
            self.save();
            callback();
        });
    }
},{
    definition:{
        name:'artist',
        key:'name'
    }
});
var ArtistsList=Porridge.Collection.extend({
    model:Artist,
    forName:function(artistName){
        return this.find(function(artist){ return artist.get('name') === artistName; });
    },
    comparator:function(artist){return artist.get('name');}
});
//name and artist fields
var Album=Backbone.Model.extend({
    findImage:function(callback){
        var self=this;
        dataService.getAlbumImage(this.get('artist'),this.get('name'),function(image){
            self.set({image:image});
            callback();
        });
    }
});
var AlbumList=Backbone.Collection.extend({
    model:Album,
    isExist:function(album){
        var foundedAlbum=this.forModel(album);
        return foundedAlbum!==undefined;
    },
    //find album model from list that has the same name
    forModel:function(albumToFind){
        return this.find(function(album){ return album.get('name') === albumToFind.get('name')});
    },
    forName:function(albumName){
        return this.find(function(album){ return album.get('name') === albumName; });
    },
    comparator:function(album){return album.get('name');}
});
var PlayList=Porridge.Model.extend({
    defaults:{
        songs:[]
    },
    findSongs:function(){
        var songsArray=this.get('songs')||[];
        return new SongsList(songsArray);
    },
    findImage:function(callback){
        var songs=this.findSongs();
        if(songs.length>0){
            var firstSong=songs.first();
            dataService.getAlbumImage(firstSong.get('artist'),firstSong.get('album'),callback);
        }
        else{
            callback('css/images/no_picture.png');
        }
    },
    findGenres:function(){
        return this.findSongs().listOfGenres();
    }
},{
    definition:{
        name:'playlist',
        key:'id'
    }
});
var PlayLists=Porridge.Collection.extend({
    model: PlayList,
    forName:function(playlistName){
        return this.find(function(playlist){ return playlist.get('name') === playlistName; });
    },
    comparator:function(playlist){return playlist.get('name');}
});
var SoundCloudTrack=Backbone.Model.extend({});
var SoundCloudTrackList=Backbone.Collection.extend({
    model:SoundCloudTrack,
    url:function(){
        return '/sc/tracks?access_token='+AppController.settings.getScAccessToken();
    }
});