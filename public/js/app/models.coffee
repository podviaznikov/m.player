S4 = ->
  (((1 + Math.random()) * 0x10000) | 0).toString(16).substring 1
guid = ->
  S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4()
dataService = require("./data.service").dataService
database =
  id: "m-player-db-10"
  description: "The database for the Movies"
  migrations: [
    version: "1.2"
    migrate: (db, versionRequest, next) ->
      songsStore = db.createObjectStore("songs")
      artistsStore = db.createObjectStore("artists")
      playlistsStore = db.createObjectStore("playlists")
      next()
  ,
    version: "1.3"
    migrate: (db, versionRequest, next) ->
      songsStore = versionRequest.transaction.objectStore("songs")
      songsStore.createIndex "idIndex", "id",
        unique: true

      songsStore.createIndex "artistIndex", "artist",
        unique: false

      artistsStore = versionRequest.transaction.objectStore("artists")
      artistsStore.createIndex "nameIndex", "name",
        unique: true

      playlistsStore = versionRequest.transaction.objectStore("playlists")
      playlistsStore.createIndex "idIndex", "id",
        unique: true

      next()
   ]

DataTransfer =
  create: (type, value) ->
    Object.create this,
      type:
        value: type

      value:
        value: value

  toString: ->
    JSON.stringify
      type: @type
      value: @value

  fromString: (source) ->
    JSON.parse source

Song = exports.Song = class Song extends Backbone.Model
  database: database
  storeName: "songs"
  defaults:
    album: "No information"
    title: "No information"
    artist: "No information"
    year: ""
    genre: ""

  initialize: ->
    if not @get("id") and not @id
      @id = guid()
      @set id: @id

  remove: ->
    @destroy()
    fs.util.remove @get("fileName")

  findImage: (callback) ->
    self = this
    dataService.getAlbumImage @get("artist"), @get("album"), (image) ->
      self.set image: image
      callback()

SongsList = exports.SongsList =  class SongsList extends Backbone.Collection
  database: database
  storeName: "songs"
  model: Song
  comparator: (song) ->
    track = song.get("track")
    return parseInt(track, 10)  if track and track isnt ""
    song.get "name"

  buildAlbumModel: (album, artist) ->
    new Album(
      name: album
      artist: artist
      songs: @forAlbum(album)
    )

  forAlbum: (album) =>  @filter (song) -> song.get("album") is album

  listOfAlbums: -> _.uniq(@pluck("album")) or []

  listOfGenres: -> _.uniq(@pluck("genre")) or []

  listOfAlbumsModels: ->
    albums = new AlbumList()
    if @length > 0
      artist = @first().get("artist")
      albumsArray = @listOfAlbums()
      self = this
      _.each albumsArray, (album) ->
        songs = self.forAlbum(album)
        albums.add new Album(
          name: album
          artist: artist
          songs: new SongsList(songs)
        )
    albums

  remove: => @each (song) -> song.remove()

Artist = exports.Artist = class Artist extends Backbone.Model
  database: database
  storeName: "artists"
  defaults:
    isDeleted: false
    songsCount: 0
    albums: []
    genres: []

  initialize: ->
    _.bindAll this, "setParameterFromSongs", "remove"
    @songs = new SongsList()
    @albumsModels = new AlbumList()
    @songs.bind "reset", @setParameterFromSongs
    @songs.fetch conditions:
      artist: @get("name")

  setParameterFromSongs: ->
    albums = @songs.listOfAlbums()
    genres = @songs.listOfGenres()
    songsCount = @songs.length
    @set
      albums: albums
      genres: genres
      songsCount: songsCount

    @set isDeleted: true  if songsCount is 0
    @albumsModels.reset @songs.listOfAlbumsModels().models

  remove: ->
    @set isDeleted: true
    @songs.remove()
    @model.save()

  findImage: (callback) ->
    self = this
    dataService.getArtistImage @get("name"), (image) ->
      self.set image: image
      self.save()
      callback()

ArtistsList = exports.ArtistsList = class ArtistsList extends Backbone.Collection
  database: database
  storeName: "artists"
  model: Artist
  forName: (artistName) => @find (artist) -> artist.get("name") is artistName
  comparator: (artist) => artist.get "name"

Album = exports.Album = class Album extends Backbone.Model
  findImage: (callback) =>
    dataService.getAlbumImage @get("artist"), @get("name"), (image) =>
      @set image: image
      callback()

AlbumList = exports.AlbumList = class AlbumList extends Backbone.Collection
  model: Album
  isExist: (album) ->
    foundedAlbum = @forModel(album)
    foundedAlbum isnt `undefined`

  forModel: (albumToFind) => @find (album) -> album.get("name") is albumToFind.get("name")

  forName: (albumName) => @find (album) -> album.get("name") is albumName

  comparator: (album) => album.get "name"

PlayList = exports.PlayList = class PlayList extends Backbone.Model
  database: database
  storeName: "playlists"
  defaults:
    songs: []

  findSongs: =>
    songsArray = @get("songs") or []
    new SongsList(songsArray)

  findImage: (callback) =>
    songs = @findSongs()
    if songs.length > 0
      firstSong = songs.first()
      dataService.getAlbumImage firstSong.get("artist"), firstSong.get("album"), callback
    else
      callback "css/images/no_picture.png"

  findGenres: => @findSongs().listOfGenres()

PlayLists = exports.PlayLists = class PlayLists extends Backbone.Collection
  database: database
  storeName: "playlists"
  model: PlayList
  forName: (playlistName) =>  @find (playlist) -> playlist.get("name") is playlistName

  comparator: (playlist) => playlist.get "name"

SoundCloudTrack = Backbone.Model.extend({})
SoundCloudTrackList = Backbone.Collection.extend(
  model: SoundCloudTrack
  url: ->
    "/sc/tracks?access_token=" + AppController.settings.getScAccessToken()
)

