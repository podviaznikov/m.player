ArtistsList = require("./models").ArtistsList
PlayLists = require("./models").PlayLists
AlbumList = require("./models").AlbumList
LibraryMenu = exports.LibraryMenu = Backbone.View.extend(
  el: $("#library_menu")
  searchField: $("#library_menu header input")
  artistsContent: $("#artists_library_content")
  albumsContent: $("#albums_library_content")
  playListsContent: $("#playlists_library_content")
  soundCloudContent: $("#soundcloud_library_content")
  events:
    "click #show_artists": "showArtists"
    "click #show_playlists": "showPlayLists"
    "click #show_albums": "showAlbums"
    "click #show_soundcloud": "showSoundCloud"
    "blur input": "filterLibrary"
    "keyup input": "keyPressed"

  initialize: ->
    Backbone.View::initialize.apply this, arguments
    @artists = new ArtistsList()
    @playLists = new PlayLists()
    @albums = new AlbumList()
    @tabName = "artists"
    _.bindAll this, "addArtist", "addPlayList", "addPlayLists", "addAlbum", "addSoundCloudTrack", "addSoundCloudTracks", "showArtists", "showPlayLists", "showAlbums", "showSoundCloud", "allArtistsLoaded", "filterLibrary", "keyPressed", "showSoundCloudMenu"
    @artists.bind "add", @addArtist
    @artists.bind "reset", @allArtistsLoaded
    @playLists.bind "add", @addPlayList
    @playLists.bind "reset", @addPlayLists
    @artists.fetch
      success: (o) ->
        console.log "xxx"

      error: (o) ->
        console.log "xxx1"

  showSoundCloudMenu: ->
    @$("#show_soundcloud").removeClass "hidden"

  keyPressed: (event) ->
    keyCode = event.keyCode
    @filterLibrary()  if keyCode is 13

  allArtistsLoaded: ->
    console.log "arts", @artists
    @artists.each @addArtist
    lastArtist = AppController.settings.getLastArtist()
    if lastArtist
      lastPlayedArtist = @artists.forName(lastArtist)
      lastPlayedArtist.view.selectArtist()  if lastPlayedArtist and lastPlayedArtist.view

  showArtists: ->
    @tabName = "artists"
    @$(@searchField).attr "placeholder", "Search artist"
    @artistsContent.show()
    @albumsContent.hide()
    @playListsContent.hide()
    @soundCloudContent.hide()

  showAlbums: ->
    @tabName = "albums"
    @$(@searchField).attr "placeholder", "Search album"
    @albumsContent.show()
    @artistsContent.hide()
    @playListsContent.hide()
    @soundCloudContent.hide()

  showPlayLists: ->
    @tabName = "playlists"
    @$(@searchField).attr "placeholder", "Search play list"
    @playListsContent.show()
    @artistsContent.hide()
    @albumsContent.hide()
    @soundCloudContent.hide()

  showSoundCloud: ->
    @tabName = "soundcloud"
    @$(@searchField).attr "placeholder", "Search tracks"
    @soundCloudContent.show()
    @playListsContent.hide()
    @artistsContent.hide()
    @albumsContent.hide()

  addAlbum: (album) ->
    unless @albums.isExist(album)
      @albums.add album
      view = new AlbumMenuView(model: album)
      @albumsContent.append view.render().el
    else
      albumFromList = @albums.forModel(album)
      albumFromList.get("songs").add album.get("songs").models
      albumFromList.trigger "add"

  addArtist: (artist) ->
    self = this
    if artist.get("name") and not artist.get("isDeleted")
      artist.albumsModels.bind "reset", ->
        albums = this
        albums.each self.addAlbum

      view = new ArtistMenuView(model: artist)
      @artistsContent.append view.render().el

  addPlayList: (playList) ->
    view = new PlayListMenuView(model: playList)
    @playListsContent.append view.render().el

  addSoundCloudTrack: (soundCloudTrack) ->
    view = new SoundCloudTrackMenuView(model: soundCloudTrack)
    @soundCloudContent.append view.render().el

  addSoundCloudTracks: ->
    @soundCloudTracks.each @addSoundCloudTrack

  addPlayLists: ->
    @playLists.each @addPlayList

  filterLibrary: ->
    filterValue = @searchField.val()
    containerItems = @artists
    if @tabName is "soundcloud"
      containerItems = @soundCloudTracks
    else if @tabName is "playlists"
      containerItems = @playLists
    else containerItems = @albums  if @tabName is "albums"
    if not filterValue or filterValue is ""
      containerItems.each (item) ->
        item.view.show()  if item.view
    else
      containerItems.each (item) ->
        if _.contains(item.get("name"), filterValue)
          item.view.show()  if item.view
        else
          item.view.hide()  if item.view
)
ArtistMenuView = Backbone.View.extend(
  className: "lib-item-data box"
  tagName: "article"
  tplId: "artist_tpl"
  events:
    click: "selectArtist"
    dblclick: "playArtistSongs"
    "click .delete_artist": "deleteArtist"
    "click .bio_artist": "showArtistBio"
    "click .album_link": "selectAlbum"
    "dblclick .album_link": "playAlbumSongs"
    dragstart: "handleDragStart"

  initialize: ->
    Backbone.View::initialize.apply this, arguments
    _.bindAll this, "render", "selectArtist", "playArtistSongs", "deleteArtist", "selectAlbum", "playAlbumSongs", "showArtistBio", "handleDragStart"
    @model.songs.bind "all", @render
    @model.bind "change", @render
    @model.view = this

  render: ->
    @renderTpl()
    @el.draggable = true
    @el.dataset.artist = @model.get("name")
    this

  handleDragStart: (e) ->
    event = e.originalEvent
    dataTransferObj = event.dataTransfer
    artist = event.srcElement.dataset.artist
    dataTransfer = DataTransfer.create("artist", artist)
    dataTransferObj.effectAllowed = "move"
    dataTransferObj.setData "text/plain", dataTransfer.toString()

  selectArtist: ->
    $(".lib-item-data").removeClass "selected-lib-item"
    $(@el).addClass "selected-lib-item"
    AppController.detailsView.showAlbums @model.albumsModels, @model.songs

  playArtistSongs: ->
    @selectArtist()
    AppController.playlistView.setSongsAndPlay @model.songs

  playAlbumSongs: (e) ->
    album = e.currentTarget.dataset.album
    albumSongs = @model.songs.forAlbum(album)
    AppController.detailsView.songs.reset albumSongs
    AppController.playlistView.setSongsAndPlay albumSongs

  deleteArtist: ->
    @model.set isDeleted: true
    @model.save()
    @$(@el).remove()

  selectAlbum: (e) ->
    album = e.currentTarget.dataset.album
    albumModel = @model.songs.buildAlbumModel(album, @model.get("name"))
    AppController.detailsView.showAlbum albumModel

  showArtistBio: ->
    AppController.detailsView.showBio @model
)
AlbumMenuView = Backbone.View.extend(
  className: "lib-item-data box"
  tagName: "article"
  tplId: "album_lib_tpl"
  events:
    click: "selectAlbum"
    dblclick: "playAlbumSongs"
    dragstart: "handleDragStart"

  initialize: ->
    Backbone.View::initialize.apply this, arguments
    _.bindAll this, "selectAlbum", "playAlbumSongs", "handleDragStart"
    @model.bind "change", @render
    @model.bind "add", @render
    @model.view = this

  render: ->
    self = this
    @model.findImage ->
      self.renderTpl()

    @el.draggable = true
    @el.dataset.album = @model.get("name")
    this

  handleDragStart: (e) ->
    event = e.originalEvent
    dataTransferObj = event.dataTransfer
    album = event.srcElement.dataset.album
    dataTransfer = DataTransfer.create("album", album)
    dataTransferObj.effectAllowed = "move"
    dataTransferObj.setData "text/plain", dataTransfer.toString()

  playAlbumSongs: (e) ->
    @selectAlbum()
    AppController.playlistView.setSongsAndPlay @model.get("songs")

  selectAlbum: ->
    $(".lib-item-data").removeClass "selected-lib-item"
    $(@el).addClass "selected-lib-item"
    albumSongs = @model.get("songs")
    AppController.detailsView.showAlbum @model
)
PlayListMenuView = Backbone.View.extend(
  className: "lib-item-data box"
  tagName: "article"
  tplId: "saved_playlist_tpl"
  events:
    click: "selectPlayList"
    dblclick: "playPlayList"
    "click .delete_playlist": "deletePlaylist"
    dragstart: "handleDragStart"

  initialize: ->
    Backbone.View::initialize.apply this, arguments
    _.bindAll this, "render", "renderPlayListInfo", "selectPlayList", "playPlayList", "deletePlaylist", "handleDragStart"
    @model.bind "change", @render
    @model.view = this

  render: ->
    @model.findImage @renderPlayListInfo
    @el.draggable = true
    @el.dataset.playlist = @model.get("name")
    this

  renderPlayListInfo: (image) ->
    @renderTpl
      image: image
      name: @model.get("name")
      genres: @model.findGenres()
      songsCount: @model.get("songs").length

  handleDragStart: (e) ->
    event = e.originalEvent
    dataTransferObj = event.dataTransfer
    playlist = event.srcElement.dataset.playlist
    dataTransfer = DataTransfer.create("playlist", playlist)
    dataTransferObj.effectAllowed = "move"
    dataTransferObj.setData "text/plain", dataTransfer.toString()

  selectPlayList: ->
    $(".lib-item-data").removeClass "selected-lib-item"
    $(@el).addClass "selected-lib-item"
    AppController.detailsView.showPlayList @model

  playPlayList: ->
    @selectPlayList()
    AppController.playlistView.setSongsAndPlay @model.findSongs()

  deletePlaylist: ->
    @model.destroy()
    @$(@el).remove()
)
SoundCloudTrackMenuView = Backbone.View.extend(
  className: "lib-item-data box"
  tagName: "article"
  tplId: "sound_cloud_track_menu_tpl"
  events:
    click: "playTrack"

  initialize: ->
    Backbone.View::initialize.apply this, arguments
    _.bindAll this, "playTrack"
    @model.view = this

  playTrack: ->
    AppController.playerCtrl.play @model.get("url")
)

