AppView = require("./ui.app").AppView
VisualizationView = require("./ui.app").VisualizationView
PlayerCtrl = require("./ui.player").PlayerCtrl
PlayListView = require("./ui.playlist").PlayListView
LibraryMenu = require("./ui.library").LibraryMenu
DetailsView = require("./ui.details").DetailsView
AppController =
  init: ->
    newHeight = $(window).height() - 105
    playingSongPanel = $("#playing_songs")
    $(".scrollable_panel").height newHeight
    $(window).bind "hashchange", ->
      console.log "Hashchange fired!"
      AppController.handleAuthentication()

    AppController.handleAuthentication()
    playingSongPanel.height "initial"
    playingSongPanel.css "max-height", newHeight - 184
    @appView = new AppView()
    @playerCtrl = new PlayerCtrl()
    console.log "init controller"
    @visualizationView = new VisualizationView()
    @visualizationView.el.height newHeight
    AppController.playlistView = new PlayListView()
    AppController.libraryMenu = new LibraryMenu()
    AppController.detailsView = new DetailsView()

  handleAuthentication: ->
    accessToken = _.firstHashValue()
    if accessToken
      console.log "Auth token:", accessToken
      if _.secondHashKey() is "scope"
        dataService.getScUser accessToken, (userData) ->
          scUsername = userData.full_name or userData.username
          if scUsername
            AppController.settings.saveScAccessToken accessToken
            AppController.settings.saveScUser scUsername
            AppController.playerCtrl.scLogin scUsername
            AppController.libraryMenu.showSoundCloudMenu()
            AppController.libraryMenu.soundCloudTracks.fetch()
      else
        dataService.getFbUser accessToken, (userData) ->
          if userData.name
            AppController.settings.saveFbAccessToken accessToken
            AppController.settings.saveFbUser userData.name
            AppController.playerCtrl.fbLogin userData.name

  facebookConnect: ->
    AppController.playerCtrl.fbLogin AppController.settings.getFbUser()  if AppController.settings.isFbLogined()

  soundcloudConnect: ->
    if AppController.settings.isScLogined()
      AppController.playerCtrl.scLogin AppController.settings.getScUser()
      AppController.libraryMenu.showSoundCloudMenu()

  lastfmConnect: ->
    unless AppController.settings.isLastFmLogined()
      dataService.getSession (data) ->
        console.log "Last.fm session data", data
        AppController.settings.saveLastFmUser data.user
        AppController.settings.saveLastFmSessionKey data.key
        if AppController.settings.isLastFmLogined()
          AppController.playerCtrl.lastFmLogin()
        else
          AppController.playerCtrl.lastFmExit()
    else
      AppController.playerCtrl.lastFmLogin()

  settings:
    saveDbVersion: (dbVersion) ->
      localStorage.setItem "dbVersion", dbVersion

    getDbVersion: ->
      localStorage.getItem "dbVersion"

    saveShuffle: (isShuffle) ->
      localStorage.setItem "isShuffle", isShuffle

    isShuffle: ->
      value = localStorage.getItem("isShuffle")
      (if value then JSON.parse(value) else false)

    saveRepeat: (isRepeat) ->
      localStorage.setItem "isRepeat", isRepeat

    isRepeat: ->
      value = localStorage.getItem("isRepeat")
      (if value then JSON.parse(value) else false)

    saveLastSong: (song) ->
      localStorage.setItem "lastSong", JSON.stringify(song)

    getLastSong: ->
      JSON.parse localStorage.getItem("lastSong")

    saveVolume: (volume) ->
      localStorage.setItem "playerVolume", volume

    getVolume: ->
      localStorage.getItem("playerVolume") or 0.5

    savePlayList: (songs) ->
      localStorage.setItem "playlist", JSON.stringify(songs)

    getPlayList: ->
      models = JSON.parse(localStorage.getItem("playlist"))
      new SongsList(models)

    saveLastArtist: (artist) ->
      localStorage.setItem "lastArtist", artist

    getLastArtist: ->
      localStorage.getItem "lastArtist"

    saveLastAlbum: (album) ->
      localStorage.setItem "lastAlbum", album

    getLastAlbum: ->
      localStorage.getItem "lastAlbum"

    saveLastFmUser: (user) ->
      localStorage.setItem "user", user

    getLastFmUser: ->
      localStorage.getItem("user") or ""

    saveLastFmSessionKey: (sessionKey) ->
      localStorage.setItem "sessionKey", sessionKey

    getLastFmSessionKey: ->
      localStorage.getItem("sessionKey") or ""

    isLastFmLogined: ->
      @getLastFmUser() isnt "" and @getLastFmSessionKey() isnt ""

    saveFbAccessToken: (accessToken) ->
      localStorage.setItem "fb_access_token", accessToken

    getFbAccessToken: (accessToken) ->
      localStorage.getItem("fb_access_token") or ""

    saveFbUser: (fbUser) ->
      localStorage.setItem "fb_user_name", fbUser

    getFbUser: (accessToken) ->
      localStorage.getItem("fb_user_name") or ""

    isFbLogined: ->
      @getFbUser() isnt "" and @getFbAccessToken() isnt ""

    saveScAccessToken: (accessToken) ->
      localStorage.setItem "sc_access_token", accessToken

    getScAccessToken: (accessToken) ->
      localStorage.getItem("sc_access_token") or ""

    saveScUser: (scUser) ->
      localStorage.setItem "sc_user_name", scUser

    getScUser: (accessToken) ->
      localStorage.getItem("sc_user_name") or ""

    isScLogined: ->
      @getScUser() isnt "" and @getScAccessToken() isnt ""

  metadataParser:
    parse: (name, binaryData, callback) ->
      startDate = new Date().getTime()
      ID3.loadTags name, (->
        console.log "Time: " + ((new Date().getTime() - startDate) / 1000) + "s"
        parsedTags = ID3.getAllTags(name)
        tags = {}
        originalTrack = parsedTags.track
        if originalTrack and _.isString(originalTrack)
          slashIndex = originalTrack.indexOf("/")
          tags.track = originalTrack.substring(0, slashIndex)  if slashIndex > 0
          tags.track = originalTrack.substring(1)  if "0" is originalTrack.charAt(0)
        tags.artist = parsedTags.artist.trim()  if parsedTags.artist
        tags.title = parsedTags.title.trim()  if parsedTags.title
        tags.album = parsedTags.album.trim()  if parsedTags.album
        tags.year = parsedTags.year.trim()  if parsedTags.year
        tags.genre = parsedTags.genre.trim()  if parsedTags.genre
        callback tags
      ),
        tags: [ "artist", "title", "album", "year", "track", "genre" ]
        dataReader: new FileAPIReader(binaryData)

_.mixin
  contains: (str1, str2) ->
    str1.toUpperCase().indexOf(str2.toUpperCase()) isnt -1

  firstHashValue: ->
    window.location.hash.substring(1).split("&")[0].split("=")[1]

  secondHashKey: ->
    window.location.hash.substring(1).split("&")[1].split("=")[0]

Backbone.View::hide = ->
  @$(@el).hide()
  this

Backbone.View::show = ->
  @$(@el).show()
  this

Backbone.View::html = (html) ->
  @$(@el).html html
  this

Backbone.View::initialize = ->
  _.bindAll this, "render", "renderTpl"
  @tpl = $("#" + @tplId).html()  if @tplId

Backbone.View::tplId = ""
Backbone.View::render = ->
  @renderTpl()
  this

Backbone.View::renderTpl = (model) ->
  modelToRender = model or @model.toJSON()
  if @tpl and modelToRender
    html = _.template(@tpl, modelToRender)
    @html html
  this

exports.AppController = AppController

