// m.Player
// (c) 2011 Anton Podviaznikov, Enginimation Studio (http://enginimation.info).
// m.player may be freely distributed under the MIT license.
// For all details and documentation:
// https://github.com/podviaznikov/m.player
var musicDao = {};
musicDao.open = function(callback)
{
    var config=
    {
        dbName:'music_db_v10',
        dbDescription:'mPlayer',
        dbVersion:'1',
        stores:
        [
            {
                name:'song',
                key:'id',
                indexes:[{name:'artists',field:'artist'}]
            },
            {
                name:'artist',
                key:'name'
            }
        ]
    };
    porridge.init(config,callback);
};

musicDao.getAllArtistSongs = function(artist,handleSong,handleAllSongs)
{
    porridge.allByKey('song','artists',artist,function(data)
    {
        var song = new Song({attributes:data});
        handleSong(song);
    },handleAllSongs);
};


musicDao.getAllArtists = function(handleArtist,handleAllArtists)
{
    porridge.all('artist',function(data)
    {
        var artist=new Artist({attributes:data});
        handleArtist(artist);
    },handleAllArtists);
};
musicDao.addSong = function(song)
{
    porridge.save('song',song.toJSON(),song.id);
};
musicDao.addArtist = function(artist)
{
    porridge.save('artist',artist.toJSON(),artist.get('name'));
};
musicDao.deleteSong = function(id,success)
{
    porridge.remove('song',id,success);
};
//saving playlists to teh localStorage
musicDao.getPlayLists=function()
{
    var savedPlayLists=JSON.parse(window.localStorage.getItem('saved_playlists'))||[];
    return new PlayLists(savedPlayLists);
};
musicDao.savePlayLists=function(playLists)
{
    window.localStorage.setItem('saved_playlists',JSON.stringify(playLists));
};
musicDao.addPlayList=function(playList)
{
    var newPlayLists=musicDao.getPlayLists().add(playList);
    musicDao.savePlayLists(newPlayLists);
};