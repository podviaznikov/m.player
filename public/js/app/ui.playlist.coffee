SongsList = require("./models").SongsList
PlayListView = exports.PlayListView = Backbone.View.extend(
  el: $("#playing_list")
  infoEl: $("#playing_list #song_info_view")
  songsEl: $("#playing_list #playing_songs")
  dropFileLabel: $("#playing_list #playing_songs label")
  statEL: $("#playing_list footer")
  songInfoTpl: $("#song_info_tpl").html()
  playlistStatTpl: $("#playlist_stat_tpl").html()
  newPlayListName: $("#new_play_list")
  events:
    drop: "handleDrop"
    "blur #new_play_list": "savePlayList"
    "click #clear_playlist": "clearPlaylist"

  initialize: ->
    @songs = new SongsList()
    _.bindAll this, "addOne", "addAll", "currentSong", "currentSongIndex", "randomSong", "render", "clearPlaylist", "selectSong", "playSongModel", "savePlayList", "setPlayListModel", "removePlayListModel", "setSongsAndPlay"
    @songs.bind "selected", @selectSong
    @songs.bind "add", @addOne
    @songs.bind "reset", @addAll
    @songs.bind "all", @render

  render: ->
    @statEL.html _.template(@playlistStatTpl,
      songsCount: @songs.length
    )
    this

  setSongsAndPlay: (songs) ->
    @songs.reset songs.models
    firstSong = @songs.first()
    firstSong.view.playSong()  if firstSong
    AppController.settings.savePlayList songs

  setPlayListModel: (playList) ->
    @playList = playList
    @newPlayListName.val @playList.get("name")

  removePlayListModel: ->
    @playList = null
    @newPlayListName.val "Unsaved list"

  savePlayList: ->
    newPlaylistName = @newPlayListName.val()
    if newPlaylistName isnt "Unsaved list"
      @playList = new PlayList()  unless @playList
      songs = @songs.toJSON()
      @playList.set
        name: newPlaylistName
        songs: songs

      @playList.save()
      AppController.libraryMenu.playLists.add @playList

  clearPlaylist: ->
    @songsEl.empty()
    @songs.reset()
    AppController.settings.savePlayList @songs
    @render()

  addOne: (song) ->
    if song.get("fileName")
      @dropFileLabel.remove()
      view = new SongMiniView(model: song)
      song.view = view
      @songsEl.append view.render().el

  addAll: ->
    if @songs.length isnt 0
      @songsEl.empty()
      @songs.each @addOne

  handleDrop: (e) ->
    e.stopPropagation()
    e.preventDefault()
    dataTransfer = e.originalEvent.dataTransfer
    if dataTransfer and dataTransfer.getData("text/plain")
      transfer = DataTransfer.fromString(dataTransfer.getData("text/plain"))
      if transfer
        if "artist" is transfer.type
          artist = AppController.libraryMenu.artists.forName(transfer.value)
          if artist
            songsFromPlayList = @songs
            artist.songs.each (song) ->
              songsFromPlayList.add song
        else if "album" is transfer.type
          album = AppController.libraryMenu.albums.forName(transfer.value)
          if album
            songsFromPlayList = @songs
            album.get("songs").each (song) ->
              songsFromPlayList.add song
        else if "playlist" is transfer.type
          playList = AppController.libraryMenu.playLists.forName(transfer.value)
          if playList
            songsFromPlayList = @songs
            playList.findSongs().each (song) ->
              songsFromPlayList.add song
        else if "song" is transfer.type
          song = new Song(transfer.value)
          @songs.add song
    else
      AppController.appView.dropFiles e

  selectSong: (song) ->
    @selectedSong = song
    self = this
    song.findImage ->
      self.infoEl.html _.template(self.songInfoTpl, song.toJSON())

  randomSong: ->
    randomSong = Math.floor(Math.random() * @songs.length)
    return @randomSong()  if randomSong is @currentSong()
    randomSong

  currentSong: ->
    @songs.at @currentSongIndex()

  currentSongIndex: ->
    @songs.indexOf @selectedSong

  next: (playSongFlag) ->
    playSong = not playSongFlag
    nextSongId = -1
    if playSong and AppController.settings.isShuffle()
      nextSongId = @randomSong()
    else
      indexOfSelectedSong = @currentSongIndex()
      if indexOfSelectedSong is @songs.length - 1
        indexOfSelectedSong = -1
        playSong = false  unless AppController.settings.isRepeat()
      nextSongId = indexOfSelectedSong + 1
    nextSong = @songs.at(nextSongId)
    console.log "Next song", nextSongId, nextSong
    @playSongModel nextSong, playSong

  previous: (playSongFlag) ->
    playSong = not playSongFlag
    indexOfSelectedSong = @currentSongIndex()
    indexOfSelectedSong = @songs.length  if indexOfSelectedSong is 0
    previousSong = @songs.at(indexOfSelectedSong - 1)
    @playSongModel previousSong, playSong

  playSongModel: (song, playSong) ->
    if playSong and song and song.view
      song.view.playSong()
    else song.view.selectSong()  if not playSong and song and song.view
)
SongMiniView = Backbone.View.extend(
  className: "song-data"
  tplId: "song_mini_tpl"
  events:
    "click .song": "selectSong"
    "dblclick .song": "playSong"

  initialize: ->
    Backbone.View::initialize.apply this, arguments
    _.bindAll this, "selectSong", "playSong"

  render: ->
    @el.draggable = true
    @renderTpl()
    this

  selectSong: ->
    $(".song-data").removeClass "selected_song"
    $(@el).addClass "selected_song"
    @model.trigger "selected", @model

  playSong: ->
    AppController.settings.saveLastSong @model.toJSON()
    AppController.settings.saveLastAlbum @model.get("album")
    AppController.settings.saveLastArtist @model.get("artist")
    @selectSong()
    fs.util.getFileURL @model.get("fileName"), (er, url) ->
      AppController.playerCtrl.play url  unless er
)

