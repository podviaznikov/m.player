dataService = require("./data.service").dataService
DetailsView = exports.DetailsView = class DetailsView extends Backbone.View
  el: $("#filtered_lib")
  libDetailsPanel: $("#filtered_lib_content")
  artistBioPanel: $("#artist_bio")
  events:
    dragstart: "handleDragStart"

  initialize: ->
    Backbone.View::initialize.apply this, arguments
    _.bindAll this, "showAlbums", "showAlbum", "showPlayList", "handleDragStart", "showBio", "hideBio"
    @artistBioView = new ArtistBioView()

  showBio: (artist) ->
    @artistBioPanel.show()
    @artistBioView.setArtistModel artist
    @artistBioView.render()
    @libDetailsPanel.hide()

  hideBio: ->
    @artistBioPanel.hide()
    @artistBioView.clear()
    @libDetailsPanel.show()
    @libDetailsPanel.empty()

  showAlbums: (albumsModels, songs) ->
    @hideBio()
    albumsModels.each @showAlbum  if albumsModels
    @songs = songs

  showAlbum: (albumModel) ->
    @hideBio()
    @songs = albumModel.get("songs")
    albumView = new AlbumView(model: albumModel)
    @libDetailsPanel.append albumView.render().el

  showPlayList: (playList) ->
    @hideBio()
    playListView = new PlayListFullView(model: playList)
    @libDetailsPanel.append playListView.render().el

  handleDragStart: (e) ->
    event = e.originalEvent
    dataTransferObj = event.dataTransfer
    songId = event.srcElement.dataset.id
    dataTransferObj.effectAllowed = "move"
    if @songs
      song = @songs.get(songId)
      dataTransfer = DataTransfer.create("song", song)
      dataTransferObj.setData "text/plain", dataTransfer.toString()

class ArtistBioView extends Backbone.View
  el: $("#artist_bio")
  tplId: "artist_bio_tpl"
  initialize: ->
    Backbone.View::initialize.apply this, arguments
    _.bindAll this, "setArtistModel", "renderArtistBio", "clear"

  setArtistModel: (artist) ->
    @model = artist

  render: ->
    dataService.getArtistBio @model.get("name"), @renderArtistBio  if @model
    this

  renderArtistBio: (data) ->
    @renderTpl
      bio: unescape(data.summary)
      profiles: data.profile or {}

  clear: ->
    $(@el).html ""

class AlbumView extends Backbone.View
  className: "lib_item_full_info_panel"
  tagName: "article"
  initialize: ->
    Backbone.View::initialize.apply this, arguments

  render: ->
    @albumInfoView = new AlbumInfoView(model: @model)
    $(@el).append @albumInfoView.render().el
    @model.get("songs").each @addSong  if @model.get("songs")
    this

  addSong: (song, key) =>
    view = new SongView(
      model: song
      key: key
      songs: @model.get("songs")
    )
    song.albumView = view
    $(@el).append view.render().el

class PlayListFullView extends Backbone.View
  className: "lib_item_full_info_panel"
  tagName: "article"
  tplId: "detailed_playlist_info_tpl"
  events:
    click: "playSongs"

  initialize: ->
    Backbone.View::initialize.apply this, arguments
    _.bindAll this, "addSong", "renderPlayListInfo", "playSongs"

  render: ->
    @model.findImage @renderPlayListInfo
    this

  renderPlayListInfo: (image) ->
    @renderTpl
      image: image
      name: @model.get("name")

    _.each @model.get("songs"), @addSong

  addSong: (songData, key) ->
    song = new Song(songData)
    view = new SongView(
      model: song
      key: key
      songs: @model.get("songs")
      playList: @model
    )
    song.albumView = view
    $(@el).append view.render().el

  playSongs: ->
    AppController.playlistView.setSongsAndPlay @model.get("songs")

class AlbumInfoView extends Backbone.View
  className: "detailed_album_info_panel box"
  tagName: "section"
  tplId: "detailed_album_info_tpl"
  events:
    click: "playSongs"

  initialize: ->
    Backbone.View::initialize.apply this, arguments

  renderAlbumInfo: (data) =>
    @renderTpl
      image: data.image
      name: @model.get("name")
      releaseDate: data.releaseDate

  render: =>
    dataService.getAlbumInfo @model.get("artist"), @model.get("name"), @renderAlbumInfo
    this

  playSongs: =>
    AppController.playlistView.setSongsAndPlay @model.get("songs")

class SongView extends Backbone.View
  className: "song-data"
  tplId: "song_tpl"
  events:
    click: "selectSong"
    "click .delete_album_song": "deleteSong"
    "dblclick .song": "playSongs"

  initialize: ->
    Backbone.View::initialize.apply this, arguments
    _.bindAll this, "selectSong", "deleteSong", "onDeleteSong", "playSongs", "render"

  render: ->
    @el.draggable = true
    @el.dataset.songname = @model.get("title")
    @el.dataset.id = @model.id
    @el.id = @model.id
    @renderTpl
      track: @model.get("track") or @options.key + 1
      title: @model.get("title")

    this

  selectSong: ->
    $(".song-data").removeClass "selected_song"
    $(@el).addClass "selected_song"

  deleteSong: ->
    @model.bind "destroy", @onDeleteSong
    @model.remove()

  onDeleteSong: ->
    view = @model.albumView
    view.remove()  if view

  playSongs: ->
    songs = @options.songs
    @selectSong()
    AppController.playlistView.setSongsAndPlay songs
    if @options.playList
      AppController.playlistView.setPlayListModel @options.playList
    else
      AppController.playlistView.removePlayListModel()

