var dataService = require("./data.service").dataService;

// Generate four random hex digits.
function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}

// Generate a pseudo-GUID by concatenating random hexadecimal.
function guid() {
    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}

var database = {
  id: "m-player-db-8",
  description: "The database for the Movies",
  migrations: [{
    version: "1.0",
    migrate: function (db, versionRequest, next) {
      var songsStore = db.createObjectStore("songs");
      var artistsStore = db.createObjectStore("artists");
      var playlistsStore = db.createObjectStore("playlists");
      next();
    }
 },{
    version: "1.1",
    migrate: function (db, versionRequest, next) {
      var songsStore = versionRequest.transaction.objectStore("songs");
      songsStore.createIndex("idIndex", "id", {unique: true});
      songsStore.createIndex("artistIndex", "artist", {unique: false});
      var artistsStore = versionRequest.transaction.objectStore("artists");
      artistsStore.createIndex("nameIndex", "name", {unique: true});
      var playlistsStore = versionRequest.transaction.objectStore("playlists");
      playlistsStore.createIndex("idIndex", "id", {unique: true});
      next();
    }
  }]
};
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
var Song = exports.Song = Backbone.Model.extend({
  database: database,
  storeName: "songs",
  defaults:{
    album:'No information',
    title:'No information',
    artist:'No information',
    year:'',
    genre:''
  },
  initialize:function(){
    if(!this.get('id') && !this.id){
        this.id=guid();
        this.set({id:this.id});
      }
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
});
var SongsList = exports.SongsList = Backbone.Collection.extend({
  database: database,
  storeName: "songs",
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
  listOfAlbumsModels:function(){
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
var Artist = exports.Artist =Backbone.Model.extend({
  database: database,
  storeName: "artists",

  defaults:{
    isDeleted:false,
    songsCount:0,
    albums:[],
    genres:[]
  },
  initialize:function(){
    _.bindAll(this,'setParameterFromSongs','remove');
   // if(!this.get('id')){
   //     this.id=UUID.generate();
   //     this.set({id:this.id});
   // }
    this.songs=new SongsList();
    this.albumsModels=new AlbumList();
    this.songs.bind('reset',this.setParameterFromSongs);
    this.songs.fetch({conditions:{'artist':this.get('name')}});
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
    this.albumsModels.reset(this.songs.listOfAlbumsModels().models);
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
});
var ArtistsList = exports.ArtistsList = Backbone.Collection.extend({
  database: database,
  storeName: "artists",

  model:Artist,
  forName:function(artistName){
    return this.find(function(artist){ return artist.get('name') === artistName; });
  },
  comparator:function(artist){return artist.get('name');}
});
//name and artist fields
var Album = exports.Album = Backbone.Model.extend({
  findImage:function(callback){
    var self=this;
    dataService.getAlbumImage(this.get('artist'),this.get('name'),function(image){
        self.set({image:image});
        callback();
    });
  }
});
var AlbumList = exports.AlbumList = Backbone.Collection.extend({
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
var PlayList = exports.PlayList = Backbone.Model.extend({
  database: database,
  storeName: "playlists",

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
});
var PlayLists = exports.PlayLists = Backbone.Collection.extend({
  database: database,
  storeName: "playlists",

  model:PlayList,
  forName:function(playlistName){
    return this.find(function(playlist){ return playlist.get('name') === playlistName; });
  },
  comparator:function(playlist){return playlist.get('name');}
});
var SoundCloudTrack = Backbone.Model.extend({});
var SoundCloudTrackList = Backbone.Collection.extend({
  model:SoundCloudTrack,
  url:function(){
    return '/sc/tracks?access_token='+AppController.settings.getScAccessToken();
  }
});

