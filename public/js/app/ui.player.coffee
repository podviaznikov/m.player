dataService = require("./data.service").dataService

PlayerCtrl = exports.PlayerCtrl = class PlayerCtrl extends Backbone.View
  el: $("#player")
  mainControls: $("#main_controls_panel")
  socialControls: $("#social_controls_panel")
  playToggle: $("#play_toggle")
  soundToggle: $("#sound_toggle")
  shuffleToggle: $("#shuffle_toggle")
  repeatToggle: $("#repeat_toggle")
  playerModeToggle: $("#expand")
  helpModeToggle: $("#help")
  socialModeToggle: $("#social")
  loadedMusicSlider: false
  volumeSlider: $("#volume_slider")
  musicSlider: $("#music_slider")
  soundOffIcon: $("#sound_off_icon")
  soundOnIcon: $("#sound_on_icon")
  timeCounterEl: $("#time_counter")
  lastFmLoginBtn: $("#lastfm_login_btn")
  lastFmUsername: $("#lastfm_username")
  lastFmControlPanel: $("#lastfm_control_panel")
  fbLoginBtn: $("#fb_login_btn")
  fbLogoutBtn: $("#fb_logout_btn")
  fbUsername: $("#fb_username")
  fbControlPanel: $("#fb_control_panel")
  scLoginBtn: $("#sc_login_btn")
  scLogoutBtn: $("#sc_logout_btn")
  scUsername: $("#sc_username")
  scControlPanel: $("#sc_control_panel")
  events:
    "click #play_toggle": "togglePause"
    "click #stop_song": "stop"
    "click #previous_song": "previous"
    "click #next_song": "next"
    "click #sound_toggle": "toggleSound"
    "click #shuffle_toggle.on": "shuffleOff"
    "click #shuffle_toggle.off": "shuffleOn"
    "click #repeat_toggle.on": "repeatOff"
    "click #repeat_toggle.off": "repeatOn"
    "click #expand.on": "turnOnFullScreen"
    "click #expand.off": "turnOffFullScreen"
    "click #help.on": "turnOffHelpMode"
    "click #help.off": "turnOnHelpMode"
    "click #social.on": "hideSocialPanel"
    "click #social.off": "showSocialPanel"
    "click #volume_slider": "changedVolume"
    "click #music_slider": "changedMusicProgress"
    "click #lastfm_logout_btn": "lastFmExit"
    "click #fb_logout_btn": "fbLogout"
    "click #sc_logout_btn": "scLogout"

  initialize: ->
    @audioEl = AudioEl.newAudio("player_ctrl", {})
    @audioEl.on "updated", @updateAudioProgress
    @audioEl.on "finished", @songFinished

  scLogin: (name) =>
    @scLoginBtn.hide()
    @scControlPanel.removeClass "unlogined"
    @scControlPanel.addClass "logined"
    @scUsername.html name

  scLogout: =>
    @scLoginBtn.show()
    @scControlPanel.removeClass "logined"
    @scControlPanel.addClass "unlogined"
    @scUsername.html ""
    AppController.settings.saveScAccessToken ""
    AppController.settings.saveScUser ""

  fbLogin: (name) =>
    @fbLoginBtn.hide()
    @fbControlPanel.removeClass "unlogined"
    @fbControlPanel.addClass "logined"
    @fbUsername.html name

  fbLogout: =>
    @fbLoginBtn.show()
    @fbControlPanel.removeClass "logined"
    @fbControlPanel.addClass "unlogined"
    @fbUsername.html ""
    AppController.settings.saveFbAccessToken ""
    AppController.settings.saveFbUser ""

  lastFmLogin: =>
    @lastFmLoginBtn.hide()
    @lastFmControlPanel.removeClass "unlogined"
    @lastFmControlPanel.addClass "logined"
    @lastFmUsername.html AppController.settings.getLastFmUser()

  lastFmExit: =>
    AppController.settings.saveLastFmUser ""
    AppController.settings.saveLastFmSessionKey ""
    @lastFmControlPanel.removeClass "logined"
    @lastFmControlPanel.addClass "unlogined"
    @lastFmLoginBtn.show()
    @lastFmUsername.html ""

  showSocialPanel: =>
    @$(@el).addClass "socialized"
    @socialModeToggle.removeClass "off"
    @socialModeToggle.addClass "on"
    @$(@mainControls).addClass "hidden"
    @$(@socialControls).removeClass "hidden"

  hideSocialPanel: =>
    @$(@el).removeClass "socialized"
    @socialModeToggle.removeClass "on"
    @socialModeToggle.addClass "off"
    @$(@socialControls).addClass "hidden"
    @$(@mainControls).removeClass "hidden"

  turnOnHelpMode: =>
    @helpModeToggle.removeClass "off"
    @helpModeToggle.addClass "on"
    AppController.appView.showHelp()

  turnOffHelpMode: =>
    @helpModeToggle.removeClass "on"
    @helpModeToggle.addClass "off"
    AppController.appView.hideHelp()

  turnOnFullScreen: =>
    @playerModeToggle.removeClass "on"
    @playerModeToggle.addClass "off"
    @playerModeToggle.attr "title", "Library mode"
    AppController.appView.showFullScreen()

  turnOffFullScreen: =>
    @playerModeToggle.removeClass "off"
    @playerModeToggle.addClass "on"
    @playerModeToggle.attr "title", "Full screen mode"
    AppController.appView.hideFullScreen()

  changedMusicProgress: (e) =>
    if @loadedMusicSlider
      newX = e.offsetX
      width = @musicSlider.width()
      max = parseFloat(@musicSlider.attr("max"))
      newProgressValue = (newX / width * max)
      @musicSlider.attr "value", newProgressValue
      @audioEl.time = newProgressValue

  changedVolume: (e) =>
    newX = e.offsetX
    width = @volumeSlider.width()
    percent = newX / width
    percent = 1  if percent > 0.95
    @audioEl.volume = percent
    @volumeSlider.attr "value", percent
    AppController.settings.saveVolume percent

  toggleSound: =>
    if @audioEl.isVolumeOn()
      @soundToggle.attr "title", "Unmute"
      @soundToggle.addClass "off"
      @soundToggle.removeClass "on"
      @soundOffIcon.show()
      @soundOnIcon.hide()
    else
      @soundToggle.attr "title", "Mute"
      @soundToggle.addClass "on"
      @soundToggle.removeClass "off"
      @soundOnIcon.show()
      @soundOffIcon.hide()
    @audioEl.toggleVolume()

  shuffleOn: =>
    @shuffleToggle.attr "title", "Turn shuffle off"
    @shuffleToggle.addClass "on"
    @shuffleToggle.removeClass "off"
    AppController.settings.saveShuffle true

  shuffleOff: =>
    @shuffleToggle.attr "title", "Turn shuffle on"
    @shuffleToggle.addClass "off"
    @shuffleToggle.removeClass "on"
    AppController.settings.saveShuffle false

  repeatOn: =>
    @repeatToggle.attr "title", "Turn repeat off"
    @repeatToggle.addClass "on"
    @repeatToggle.removeClass "off"
    AppController.settings.saveRepeat true

  repeatOff: =>
    @repeatToggle.attr "title", "Turn repeat on"
    @repeatToggle.addClass "off"
    @repeatToggle.removeClass "on"
    AppController.settings.saveRepeat false

  play: (url) =>
    @loadedMusicSlider = false
    @playToggle.attr "title", "Pause"
    @playToggle.addClass "playing"
    @playToggle.removeClass "paused"
    @audioEl.play url

  togglePause: =>
    if @audioEl.isPaused()
      @play()
    else
      @playToggle.attr "title", "Play"
      @playToggle.addClass "paused"
      @playToggle.removeClass "playing"
      @audioEl.pause()

  stop: =>
    @playToggle.addClass "paused"
    @playToggle.removeClass "playing"
    @audioEl.stop()
    @loadedMusicSlider = false

  previous: =>
    AppController.playlistView.previous()

  next: =>
    AppController.playlistView.next()

  updateAudioProgress: (duration, currentTime) =>
    @$(@timeCounterEl).text @audioEl.timeCounter
    @musicSlider.attr "value", currentTime
    unless @loadedMusicSlider
      @loadedMusicSlider = true
      @musicSlider.attr "max", duration

  songFinished: =>
    currentSong = AppController.playlistView.currentSong()
    timeInSeconds = parseInt(@audioEl.time, 10)
    if currentSong
      @loadedMusicSlider = false
      dataService.scrobble currentSong.get("title"), currentSong.get("artist"), timeInSeconds
      @next()

