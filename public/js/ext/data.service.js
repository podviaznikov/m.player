// m.player
// (c) 2011 Enginimation Studio (http://enginimation.com).
// m.player may be freely distributed under the MIT license.
// For all details and documentation:
// https://github.com/podviaznikov/m.player.
"use strict";
var dataService={
    getSession:function(callback)
    {
        $.getJSON('/session',callback);
    },
    scrobble:function(track,artist,trackLength)
    {
        $.post('/song_played/'+artist+'/'+track+'/'+trackLength+'?user='+AppController.settings.getLastFmUser()
        +'&key='+AppController.settings.getLastFmSessionKey());
        fbService.setStatus('Listening '+track);
    },
    getArtistImage:function(artist,callback){
        var jqxhr = $.get('/artist/'+artist+'/image',function(data){
            callback(data);
        })
        .error(function() { callback('css/images/no_picture.png'); })
    },
    getAlbumImage:function(artist,album,callback){
        var jqxhr = $.get('/artist/'+artist+'/album/'+album+'/image',function(data){
            callback(data);
        })
        .error(function() { callback('css/images/no_picture.png'); })
    },
    getAlbumPoster:function(artist,album,callback){
        var jqxhr = $.get('/artist/'+artist+'/album/'+album+'/poster',function(data){
            callback(data);
        })
        .error(function() { callback('css/images/no_picture.png'); })
    },
    getAlbumInfo:function(artist,album,callback){
        var jqxhr = $.get('/artist/'+artist+'/album/'+album+'/info',function(data){
            callback(data);
        })
        .error(function() {
            var image='css/images/no_picture.png',
                albumName=album,
                releaseDate='no information',
                songsCount='no information';

            callback({image:image,name:albumName,releaseDate:releaseDate,songsCount:songsCount});
        });
    },
    getArtistBio:function(artist,callback)
    {
        var jqxhr = $.getJSON('/artist/'+artist+'/bio',function(data){
            callback(data);
        })
        .error(function() {
            callback({});
        });
    }
};
var fbService={
    isLogined:false,
    init:function(){
        FB.init({
            appId  : '222066051151670',
            status : true, // check login status
            cookie : true, // enable cookies to allow the server to access the session
            xfbml  : false  // don't parse XFBML
        });
        FB.Event.subscribe('auth.login',function(response){
            fbService.isLogined=true;
        });
    },
    login:function(callback){
        //get username if logined
        if(fbService.isLogined){
              fbService.getUserName(callback);
        }
        //login if not logined
        else{
            FB.login(function(response){
                if(response.session){
                    fbService.isLogined=true;
                    fbService.getUserName(callback);
                }
                else{
                    callback('failed to login');
                }
            });
        }
    },
    logout:function(){
        FB.logout(function(response){
            fbService.isLogined=false;
        });
    },
    getUserName:function(callback){
        FB.api('/me', function(response){
          callback(undefined,response.name);
        });
    },
    //change status of teh logined user to new one
    setStatus:function(status){
        FB.getLoginStatus(function(response){
            if(response.session){
                FB.api({
                    method:'status.set',
                    status:status},
                    function(response){
                        if(response == 0){
                            console.log('Your facebook status was not updated.');
                        }else{
                            console.log('Your facebook status was updated');
                        }
                    }
                );
            }else{
                console.log('user not logined');
            }
        });
    },
    //get name of the logined user
    getName:function(callback){
        FB.api('/me',function(response){
          callback(response.name);
        });
    }
};