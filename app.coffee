util = require("util")
express = require("express")
connect = require("connect")
appCache = require("connect-app-cache")
soundcloud = require("soundcloud")
nbs = require("nbs-api")
facebook = require("facebook-graph")
stitch = require("stitch")
LastFmNode = require("lastfm").LastFmNode
lastfm = new LastFmNode(
  api_key: "e3377f4b4d8c6de47c7e2c81485a65f5"
  secret: "99523abcd47bd54b5cfa10cf9bb81f20"
)
app = express.createServer()
nbs.init "mplayer"


scrobble = (trackName, artist, trackLength, key, user) ->
  session = lastfm.session(user, key)
  startedTime = Math.round(((new Date().getTime()) / 1000) - parseInt(trackLength, 10))
  LastFmUpdate = lastfm.update("scrobble", session,
    track:
      name: trackName
      artist:
        "#text": artist

    timestamp: startedTime
  )
  util.log "Started time for scrobbling is " + startedTime
  LastFmUpdate.on "success", (track) ->
    util.log "succesfull scrobble"
    util.log util.inspect(track)

  LastFmUpdate.on "error", (track, error) ->
    util.log track
    util.log error
    util.log "unsuccesfull scrobble=" + error


clientPath = __dirname + "/public/js/app"
libPath = __dirname + "/public/js/lib/"

package = stitch.createPackage(
  paths: [clientPath]
  dependencies: [
    libPath + "jquery.min.js"
    libPath + "underscore-min.js"
    libPath + "backbone-min.js"
    libPath + "async.min.js"
    libPath + "fs.js"
    libPath + "backbone-indexeddb.js"
    #libPath + "jschardet.min.js"
    libPath + "id3.reader.js"
  ]
)

app.get('/application.js', package.createServer());

app.configure ->
  app.use connect.favicon(__dirname + "/public/16.png")
  app.use express.logger()
  app.use express.bodyParser()
  app.use express.cookieParser()
  app.use express.session(
    secret: "super_hard_session_secret"
    cookie:
      path: "/"
      httpOnly: true
      maxAge: 14400000
  )
  app.use app.router
  app.use express.static(__dirname + "/public")
  app.set "views", __dirname + "/views"
  app.set "view options",
    layout: false

  app.use appCache("app.mf", __dirname + "/app.mf",
    maxAge: 0
  )

app.get "/", (req, res) ->
  res.render "index.jade",
    layout: false

app.get "/fb/user", (req, res) ->
  accessToken = req.query.access_token
  util.log "FB access token ready:", accessToken
  graph = new facebook.GraphAPI(accessToken)
  graph.getObject "me", (error, data) ->
    if error
      util.log "Error:" + error
      res.json {}
    else
      util.log "Data from FB:" + util.inspect(data)
      res.json data

app.get "/sc/user", (req, res) ->
  accessToken = req.query.access_token
  if accessToken
    util.log "SC access token ready:", accessToken
    soundcloud.me accessToken, (data) ->
      util.log "SC profile received"
      util.log util.inspect(data)  if data
      res.json data
  else
    res.json []

app.get "/sc/tracks", (req, res) ->
  accessToken = req.query.access_token
  if accessToken
    util.log "SC access token ready:", accessToken
    soundcloud.myPrivateStreamableTracks accessToken, (data) ->
      util.log "SC resp:" + util.inspect(data)
      res.json data
  else
    res.json {}

app.get "/session_data", (req, res) ->
  session = req.session
  if not session or not req.session.user or not req.session.key
    res.json
      user: ""
      key: ""
  else
    user = req.session.user or ""
    key = req.session.key or ""
    util.log util.inspect(session)
    res.json
      user: user
      key: key

app.post "/song_played", (req, res) ->
  track = req.query.track
  artist = req.query.artist
  length = req.query.length
  user = req.query.user
  key = req.query.key
  accessToken = req.query.access_token
  util.log "scrobbling" + user + key + accessToken
  scrobble track, artist, length, key, user  if user and key
  if accessToken
    graph = new facebook.GraphAPI(accessToken)
    graph.putObject "me", "feed",
      message: "Listening " + artist + " '" + track + "' "
    , (error, data) ->
      if error
        util.log "Error:" + error
      else
        util.log "Data from FB:" + util.inspect(data)

app.get "/auth", (req, res) ->
  token = req.query.token
  session = lastfm.session()
  util.log "token=" + token
  session.authorise token,
    handlers:
      authorised: (session) ->
        util.log "authorised"
        util.log util.inspect(req)
        util.log util.inspect(session)
        req.session.user = session.user
        req.session.key = session.key
        res.redirect "home"

app.get "/artist/:artistName/image", (req, res) ->
  image = "css/images/no_picture.png"
  util.log "Getting image for=" + req.params.artistName
  request = lastfm.request("artist.getInfo",
    artist: req.params.artistName
    handlers:
      success: (apiResp) ->
        data = JSON.parse(apiResp)
        image = data.artist.image[2]["#text"] or "css/images/no_picture.png"  if data and data.artist and data.artist.image[2]
        res.send image

      error: (error) ->
        res.send image
  )

app.get "/artist/:artistName/bio", (req, res) ->
  util.log "Getting bio for=" + req.params.artistName
  bio = {}
  artistName = req.params.artistName
  lastfm.request "artist.getInfo",
    artist: artistName
    handlers:
      success: (apiResp) ->
        data = JSON.parse(apiResp)
        bio = data.artist.bio  if data and data.artist and data.artist.bio
        nbs.findArtistProfileByName artistName, (err, data) ->
          bio.profile = data
          res.json bio

      error: (error) ->
        res.json bio

app.get "/artist/:artistName/album/:albumTitle/image", (req, res) ->
  image = "css/images/no_picture.png"
  util.log "Getting image for=" + req.params.albumTitle
  lastfm.request "album.getInfo",
    artist: req.params.artistName
    album: req.params.albumTitle
    handlers:
      success: (apiResp) ->
        data = JSON.parse(apiResp)
        image = data.album.image[2]["#text"] or "css/images/no_picture.png"  if data and data.album and data.album.image[2]
        res.send image

      error: (error) ->
        res.send image

app.get "/artist/:artistName/album/:albumTitle/poster", (req, res) ->
  image = "css/images/no_picture.png"
  util.log "Getting image for=" + req.params.albumTitle
  lastfm.request "album.getInfo",
    artist: req.params.artistName
    album: req.params.albumTitle
    handlers:
      success: (apiResp) ->
        data = JSON.parse(apiResp)
        image = data.album.image[4]["#text"] or "css/images/no_picture.png"  if data and data.album and data.album.image[4]
        res.send image

      error: (error) ->
        res.send image

app.get "/artist/:artistName/album/:albumTitle/info", (req, res) ->
  util.log "Getting image for=" + req.params.albumTitle
  artist = req.params.artistName
  album = req.params.albumTitle
  request = lastfm.request("album.getInfo",
    artist: artist
    album: album
    handlers:
      success: (apiResp) ->
        data = JSON.parse(apiResp).album
        unless data
          image = "css/images/no_picture.png"
          albumName = album
          releaseDate = "no information"
          songsCount = "no information"
          res.contentType "application/json"
          res.send
            image: image
            name: albumName
            releaseDate: releaseDate
            songsCount: songsCount
        else
          image = "css/images/no_picture.png"
          albumName = album
          releaseDate = data.releasedate.trim().split(",")[0] or ""
          songsCount = data.tracks.length or ""
          image = data.image[2]["#text"] or "css/images/no_picture.png"  if data and data.image[2]
          albumName = data.name.trim() or album  if data and data.name and data.name.trim()
          res.contentType "application/json"
          res.send
            image: image
            name: albumName
            releaseDate: releaseDate
            songsCount: songsCount

      error: (error) ->
        image = "css/images/no_picture.png"
        albumName = album
        releaseDate = ""
        songsCount = ""
        res.contentType "application/json"
        res.send
          image: image
          name: albumName
          releaseDate: releaseDate
          songsCount: songsCount
  )

exports.app = app
app.listen 8090

