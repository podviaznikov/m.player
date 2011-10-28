"use strict"
dataService =
  getSession: (callback) ->
    if navigator.onLine
      $.getJSON "/session_data", callback
    else
      callback {}

  getFbUser: (authToken, callback) ->
    if navigator.onLine
      $.getJSON "/fb/user?access_token=" + authToken, callback
    else
      callback {}

  getScUser: (authToken, callback) ->
    if navigator.onLine
      $.getJSON "/sc/user?access_token=" + authToken, callback
    else
      callback {}

  scrobble: (track, artist, trackLength) ->
    if navigator.onLine
      artist = escape(artist)
      track = escape(track)
      $.post "/song_played?user=" + AppController.settings.getLastFmUser() + "&key=" + AppController.settings.getLastFmSessionKey() + "&access_token=" + AppController.settings.getFbAccessToken() + "&artist=" + artist + "&track=" + track + "&length=" + trackLength

  getArtistImage: (artist, callback) ->
    if navigator.onLine
      artist = escape(artist)
      jqxhr = $.get("/artist/" + artist + "/image", callback).error(->
        callback "css/images/no_picture.png"
      )
    else
      callback "css/images/no_picture.png"

  getAlbumImage: (artist, album, callback) ->
    if navigator.onLine
      artist = escape(artist)
      album = escape(album)
      jqxhr = $.get("/artist/" + artist + "/album/" + album + "/image", callback).error(->
        callback "css/images/no_picture.png"
      )
    else
      callback "css/images/no_picture.png"

  getAlbumPoster: (artist, album, callback) ->
    if navigator.onLine
      artist = escape(artist)
      album = escape(album)
      jqxhr = $.get("/artist/" + artist + "/album/" + album + "/poster", callback).error(->
        callback "css/images/no_picture.png"
      )
    else
      callback "css/images/no_picture.png"

  getAlbumInfo: (artist, album, callback) ->
    image = "css/images/no_picture.png"
    albumName = album
    releaseDate = ""
    songsCount = ""
    if navigator.onLine
      artist = escape(artist)
      album = escape(album)
      jqxhr = $.get("/artist/" + artist + "/album/" + album + "/info", callback).error(->
        callback
          image: image
          name: albumName
          releaseDate: releaseDate
          songsCount: songsCount
      )
    else
      callback
        image: image
        name: albumName
        releaseDate: releaseDate
        songsCount: songsCount

  getArtistBio: (artist, callback) ->
    if navigator.onLine
      artist = escape(artist)
      jqxhr = $.getJSON("/artist/" + artist + "/bio", callback).error(->
        callback {}
      )
    else
      callback {}

exports.dataService = dataService

