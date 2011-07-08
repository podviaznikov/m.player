var util=require('util'),
    nbs=require('./nbs'),
    express=require('express'),
    app=express.createServer();

nbs.init('mplayer');

nbs.findArtistProfileById(356,function(err,data) {
  util.log(util.inspect(data));
});

nbs.searchArtistByName('Kanye',function(err,data){
  util.log(util.inspect(data));
});
nbs.findArtistId('Kanye',function(err,id){
    util.log('Id='+id);
});
nbs.findArtistProfileByName('Coldplay',function(err,data) {
  util.log(util.inspect(data));
});
app.listen(process.env.C9_PORT);
util.log('started app');