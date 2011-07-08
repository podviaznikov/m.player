var util=require('util'),
    querystring=require('querystring'),
    rest=require('restler'),
    BASE_URL='.api3.nextbigsound.com/',
    nbs=exports;
nbs.init=function(appname){
    this.appname=appname;
};
nbs.searchArtistByName=function(artistName,callback){
    jsonRequest('artists/search',{q:artistName},callback);
};
//method finds artists NBS id by name
nbs.findArtistId=function(artistName,callback){
    nbs.searchArtistByName(artistName,function(err,data){
        if(err){
            callback(-1);
        }
        else{
            var found=false;
            for(var key in data){
                callback(undefined,key);
                found=true;
                break;
            }
            if(!found){
                callback(-1);
            }
        }
    });
};
//method find artist profile for artist NBS id
nbs.findArtistProfileById=function(artistId,callback){
    jsonRequest('profiles/artist/'+artistId,{},callback);
};
//method find artist profile by artist name
nbs.findArtistProfileByName=function(artistName,callback){
    nbs.findArtistId(artistName,function(err,id){
        if(err){
            callback(-1);
        }
        else{
            nbs.findArtistProfileById(id,callback);        
        }
    });
};

var jsonRequest=function(resource,params,callback){
    params=params||{};
    rest.get('http://'+nbs.appname+BASE_URL+resource+'.json?'+querystring.stringify(params))
        .on('complete',function(data){callback(undefined,data);})
        .on('error',function(err){callback(err);});
};