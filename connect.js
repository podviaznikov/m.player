var connect = require('connect');
var auth= require('connect-auth');
var OAuth= require('oauth').OAuth;

var getSharedSecretForUserFunction = function(user,  callback) {
	var result;
	if(user == 'foo')
		result= 'bar';
	callback(null, result);
};

var validatePasswordFunction = function(username, password, successCallback, failureCallback){
	if (username === 'foo' && password === "bar"){
		successCallback();
	} else {
		failureCallback();
	}
};

// N.B. TO USE Any of the OAuth or RPX strategies you will need to provide
// a copy of the example_keys_file (named keys_file)
try {
  var example_keys= require('./key_file');
  for(var key in example_keys) {
    global[key]= example_keys[key];
  }
}
catch(e) {
  console.log('Unable to locate the keys_file.js file.  Please copy and ammend the example_keys_file.js as appropriate');
  return;
}

function routes(app) {


  app.get ('/auth/facebook', function(req, res, params) {
    req.authenticate(['facebook'], function(error, authenticated) {
      res.writeHead(200, {'Content-Type': 'text/html'})
      if( authenticated ) {
        console.log(req.getAuthDetails());
        res.end("<html><h1>Hello Facebook user:" + JSON.stringify( req.getAuthDetails().user ) + ".</h1></html>")
      }
      else {
        res.end("<html><h1>Facebook authentication failed :( </h1></html>")
      }
    });
  })



  app.get ('/logout', function(req, res, params) {
    req.logout();
    res.writeHead(303, { 'Location': "/" });
    res.end('');
  })

  app.get('/', function(req, res, params) {
    var self=this;
    res.writeHead(200, {'Content-Type': 'text/html'})
    if( !req.isAuthenticated() ) {
      res.end('<html>                                              \n\
          <head>                                             \n\
            <title>connect Auth -- Not Authenticated</title> \n\
            <script src="http://static.ak.fbcdn.net/connect/en_US/core.js"></script> \n\
          </head>                                            \n\
          <body>                                             \n\
            <div id="wrapper">                               \n\
              <h1>Not authenticated</h1>                     \n\
              <div class="fb_button" id="fb-login" style="float:left; background-position: left -188px">          \n\
                <a href="/auth/facebook" class="fb_button_medium">        \n\
                  <span id="fb_login_text" class="fb_button_text"> \n\
                    Connect with Facebook                    \n\
                  </span>                                    \n\
                </a>                                         \n\
              </div>                                         \n\
              <div style="float:left;margin-left:5px">       \n\
                <a href="/auth/yahoo" style="border:0px">  \n\
                 <img style="border:0px" src="http://l.yimg.com/a/i/reg/openid/buttons/1_new.png"/> \n\
                </a>                                         \n\
              </div>                                         \n\
              <div style="float:left;margin-left:5px"> \n\
                <button onclick="location.href=\'/auth/google\'" style="padding:5px;border-radius:5px;border:1px solid #555555;cursor:pointer"> \n\
                  <img src="https://www.google.com/favicon.ico" style="margin-bottom:-3px;"><span style="font-weight:bold;">&nbsp; Sign In with Google \n\
                </button> \n\
              </div> \n\
              <div style="float:left;margin-left:5px">       \n\
                <a href="/auth/twitter" style="border:0px">  \n\
                  <img style="border:0px" src="http://apiwiki.twitter.com/f/1242697715/Sign-in-with-Twitter-darker.png"/>\n\
                </a>                                         \n\
              </div>                                         \n\
              <div style="float:left;margin-left:5px">       \n\
                <a href="/auth/github" style="border:0px">  \n\
                  <img style="border:0px" src="http://github.com/intridea/authbuttons/raw/master/png/github_64.png"/>\n\
                </a>                                         \n\
              </div>                                         \n\
              <div style="float:left;margin-left:5px">       \n\
                <a href="/auth/foursquare" style="border:0px">  \n\
                  FourSquare\n\
                </a>                                         \n\
              </div>                                         \n\
            </div>                                           \n\
          </body>                                            \n\
        </html>')
    }
    else {
      res.end('<html>                                              \n\
          <head>                                             \n\
            <title>Express Auth -- Authenticated</title>\n\
          </head>                                            \n\
          <body>                                             \n\
            <div id="wrapper">                               \n\
              <h1>Authenticated</h1>     \n\
            ' + JSON.stringify( req.getAuthDetails().user ) + '   \n\
             <h2><a href="/logout">Logout</a></h2>                \n\
            </div>                                           \n\
          </body>                                            \n\
        </html>')
    }
  })
}
var server= connect.createServer(
                      connect.cookieParser(),
                      connect.session({secret: 'FlurbleGurgleBurgle',
                                       store: new connect.session.MemoryStore({ reapInterval: -1 }) }),
                      connect.bodyParser() /* Only required for the janrain strategy*/,
                      auth( [
                            auth.Anonymous(),
                            auth.Basic({validatePassword: validatePasswordFunction}),
                            auth.Digest({getSharedSecretForUser: getSharedSecretForUserFunction}),
                            auth.Http({validatePassword: validatePasswordFunction}),
                            auth.Never(),
                            auth.Twitter({consumerKey: twitterConsumerKey, consumerSecret: twitterConsumerSecret}),
                            auth.Facebook({appId : fbId, appSecret: fbSecret, scope: "email", callback: fbCallbackAddress}),
                            auth.Github({appId : ghId, appSecret: ghSecret, callback: ghCallbackAddress}),
                            auth.Yahoo({consumerKey: yahooConsumerKey, consumerSecret: yahooConsumerSecret, callback: yahooCallbackAddress}),
                            auth.Google({consumerKey: googleConsumerKey, consumerSecret: googleConsumerSecret, scope: "", callback: googleCallbackAddress}),
                            auth.Foursquare({consumerKey: foursquareConsumerKey, consumerSecret: foursquareConsumerSecret}),
                            auth.Janrain({apiKey: janrainApiKey, appDomain: janrainAppDomain, callback: janrainCallbackUrl})
                            ]),

                      connect.router(routes));
server.listen(3000);