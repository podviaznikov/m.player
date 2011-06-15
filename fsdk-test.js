var connect = require('connect'),
    fbsdk = require('facebook-sdk');

var port = 3000;
connect()
  .use(connect.favicon())
  .use(connect.cookieParser())
  .use(connect.bodyParser())
  .use(fbsdk.facebook({
    appId  : '222066051151670',
    secret : 'e4f631a8fcadb28744da863a9bf00e43'
  }))
  .use(function(req, res, next) {

    if (req.facebook.getSession()) {

      // get my graph api information
      req.facebook.api('/me', function(me) {
        console.log(me);

        if (me.error) {
          res.end('An api error occured, so probably you logged out. Refresh to try it again...');
        } else {
          res.end('<a href="' + req.facebook.getLogoutUrl() + '">Logout</a>');
        }
      });

    } else {
      res.end('<a href="' + req.facebook.getLoginUrl() + '">Login</a>');
    }

  })
  .listen(port);

console.log('Listening for http requests on port ' + port);