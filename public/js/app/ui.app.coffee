Song = require("./models").Song
Artist = require("./models").Artist

AppView = exports.AppView = class AppView extends Backbone.View.extend
  el: $("body")
  progress: $("#uploading_files_progress progress")
  helpScreen: $("#help_screen")
  mainScreen: $("#main_screen")
  isRegularMode: true
  dropFolderCtrl: $("#drop_folder")
  dropFilesCtrl: $("#drop_files")
  fileUploadStatusDialog: $("#file_upload_status_dialog")
  events:
    keyup: "keyPressed"
    dragover: "dragOverFiles"
    "drop .main_panel": "dropFiles"
    "change #drop_files": "dropFiles"
    "change #drop_folder": "dropFiles"
    "click #import_songs_directory": "importMusicDirectory"
    "click #import_songs_files": "importMusicFiles"

  initialize: ->
    _.bindAll this, "dragOverFiles", "dropFiles", "handleFileSelect", "showHelp", "hideHelp", "showFullScreen", "hideFullScreen", "keyPressed", "importMusicDirectory", "importMusicFiles", "processOneAudioFile"

  importMusicDirectory: ->
    @dropFolderCtrl.click()

  importMusicFiles: ->
    @dropFilesCtrl.click()

  dragOverFiles: (e) ->
    e.stopPropagation()
    e.preventDefault()

  dropFiles: (e) ->
    e.stopPropagation()
    e.preventDefault()
    target = e.originalEvent.dataTransfer or e.originalEvent.target
    files = target.files
    @handleFileSelect files  if files and files.length > 0

  handleFileSelect: (files, skipWrite) ->
    self = this
    fileProcessingFunctions = []
    @fileUploadStatusDialog.addClass "active"
    _.each files, (file, index) ->
      bindedFunct = async.apply(self.processOneAudioFile, file, index, files.length, skipWrite)
      fileProcessingFunctions.push bindedFunct

    async.series fileProcessingFunctions, (err, results) ->
      self.fileUploadStatusDialog.removeClass "active"

  processOneAudioFile: (file, index, filesAmount, skipWrite, callback) ->
    percent = Math.floor(((index + 1) / filesAmount) * 100)
    progressElement = @$(@progress)
    @$("#file_index").html index
    @$("#total_files_amount").html filesAmount
    @$("#uploading_files_progress header span").html file.name
    fs.read.fileAsBinaryString file, (readError, data, initialFile) ->
      return  if readError
      AppController.metadataParser.parse initialFile.name, data, (tags) ->
        console.log "Tags", tags
        song = new Song()
        tags.fileName = song.id + initialFile.extension()
        tags.originalFileName = initialFile.name
        song.set tags
        progressElement.val percent
        if skipWrite
          AppController.appView.saveSong song, callback
        else
          fs.write.file initialFile, ((writeError) ->
            unless writeError
              AppController.appView.saveSong song, callback
              AppController.playlistView.songs.add song
          ), song.get("fileName")

  saveSong: (song, callback) ->
    song.save {},
      success: (o) ->
        console.log "saved song", o

      error: (o) ->
        console.log "saved song1", o

    artistName = song.get("artist")
    artist = AppController.libraryMenu.artists.forName(artistName)
    unless artist
      artist = new Artist(name: artistName)
      artist.findImage ->
        AppController.libraryMenu.artists.add artist
        callback null
    else
      artist.set isDeleted: false
      songsCount = artist.get("songsCount") or 0
      artist.set songsCount: songsCount + 1
      artist.songs.add song,
        silent: true

      artist.save()
      artist.change()
      callback null

  showHelp: ->
    @isRegularMode = false
    @el.removeClass "fullscreen"
    @helpScreen.removeClass "hidden"
    @mainScreen.addClass "hidden"
    AppController.visualizationView.hide()

  hideHelp: ->
    @isRegularMode = true
    @mainScreen.removeClass "hidden"
    @helpScreen.addClass "hidden"

  showFullScreen: ->
    @hideHelp()
    @mainScreen.addClass "hidden"
    @el.addClass "fullscreen"
    AppController.visualizationView.show()

  hideFullScreen: ->
    @el.removeClass "fullscreen"
    if @isRegularMode
      @mainScreen.removeClass "hidden"
    else
      @helpScreen.removeClass "hidden"
    AppController.visualizationView.hide()

  keyPressed: (event) ->
    keyCode = event.keyCode
    currentSong = undefined
    currentSong = AppController.playlistView.currentSong()  if AppController.playlistView
    if keyCode is 40
      AppController.playlistView.next false
    else if keyCode is 38
      AppController.playlistView.previous false
    else if keyCode is 13
      currentSong.view.playSong()  if currentSong
    else if keyCode is 32
      AppController.playerCtrl.togglePause()
    else if keyCode is 46
      currentSong.view.remove()  if currentSong
    else if keyCode is 27
      AppController.playerCtrl.turnOffFullScreen()
      AppController.playerCtrl.turnOffHelpMode()


exports.VisualizationView = class VisualizationView extends Backbone.View.extend
  el: $("#playing_visualization")
  tplId: "visualization_tpl"
  show: ->
    @el.show()
    @render()

  hide: ->
    @el.hide()

  render: ->
    self = this
    song = AppController.playlistView.currentSong()
    if song
      dataService.getAlbumPoster song.get("artist"), song.get("album"), (image) ->
        self.renderTpl image: image
    this

