// m.Player
// (c) 2011 Anton Podviaznikov, Enginimation Studio (http://enginimation.info).
// m.player may be freely distributed under the MIT license.
// For all details and documentation:
// https://github.com/podviaznikov/m.player
var indexedDB = window.indexedDB || window.webkitIndexedDB;
var IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction;
var IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange;

var musicDao = {};
musicDao.log=function(e)
{
    console.log(e);
}
musicDao.handleError=function(e)
{
    console.log(e);
};
musicDao.db = null;
musicDao.open = function(callback)
{
    var request = indexedDB.open('music_db_v10','mPlayer');
    var version = '1';
    request.onsuccess = function(e)
    {
        musicDao.db = e.target.result;
        var db = musicDao.db;
        // We can only create Object stores in a setVersion transaction;
        if(version!= db.version)
        {
            var setVersionReq = db.setVersion(version);

            // onsuccess is the only place we can create Object Stores
            setVersionReq.onfailure = musicDao.handleError;
            setVersionReq.onsuccess = function(e)
            {
                //create songs store
                var songStore = db.createObjectStore('song','id',true);
                songStore.createIndex('artists', 'artist');
                //songStore.createIndex('albums', 'album');
                //create artists store
                var artistStore = db.createObjectStore('artist','name',true);
                musicDao.log('Created stores'+e);
                callback();
            };
        }
        else
        {
            callback();
        }

    };
   request.onfailure = musicDao.handleError;

};
musicDao.getAllSongs = function(handleSong,handleAllSongs)
{
    var trans = musicDao.db.transaction(['song'], IDBTransaction.READ_WRITE, 0);
    var store = trans.objectStore('song');

    // Get everything in the store;
    var cursorRequest = store.openCursor();

    cursorRequest.onsuccess = function(e)
    {
        var cursor = e.result ||       // The cursor is either in the event
            e.target.result;           // ...or in the request object.
        if (!cursor)                  // No cursor means no more results
        {
            if(handleAllSongs)
            {
                handleAllSongs();
            }
            return;
        }
        var object = cursor.value;      // Get the matching record
        var song = new Song({attributes:object});
        handleSong(song);            // Pass it to the callback
        cursor.continue();             // Ask for the next matching record
    };

    cursorRequest.onerror = musicDao.handleError;
};

musicDao.getAllArtistSongs = function(artist,handleSong,handleAllSongs)
{
    var db = musicDao.db;
    var trans = db.transaction(['song'], IDBTransaction.READ_WRITE, 0);
    var store = trans.objectStore('song');
    var index = store.index('artists');
    var range = new IDBKeyRange.only(artist);
    // Get everything in the store;
    var cursorRequest = index.openCursor(range);

    cursorRequest.onsuccess = function(e)
    {
        var cursor = e.result ||       // The cursor is either in the event
            e.target.result;           // ...or in the request object.
        if (!cursor)                  // No cursor means no more results
        {
            if(handleAllSongs)
            {
                handleAllSongs();
            }
            return;
        }
        var object = cursor.value;      // Get the matching record
        var song = new Song({attributes:object});
        handleSong(song);            // Pass it to the callback
        cursor.continue();             // Ask for the next matching record
    };

    cursorRequest.onerror = musicDao.handleError;
};


musicDao.getAllArtists = function(handleArtist,handleAllArtists)
{
    var trans = musicDao.db.transaction(['artist'], IDBTransaction.READ_WRITE, 0);
    var store = trans.objectStore('artist');

    // Get everything in the store;
    var cursorRequest = store.openCursor();
    cursorRequest.onsuccess = function(e)
    {
        var cursor = e.result ||       // The cursor is either in the event
            e.target.result;           // ...or in the request object.
        if (!cursor)                  // No cursor means no more results
        {
            if(handleAllArtists)
            {
                handleAllArtists();
            }
            return;
        }
        var object = cursor.value;      // Get the matching record
        var artist = new Artist({attributes:object});
        handleArtist(artist);            // Pass it to the callback
        cursor.continue();             // Ask for the next matching record
    };

    cursorRequest.onerror = musicDao.handleError;
};
musicDao.addSong = function(song)
{
    var trans = musicDao.db.transaction(['song'], IDBTransaction.READ_WRITE, 0);
    var store = trans.objectStore('song');
    var request = store.put(song.toJSON(),song.id);

    request.onsuccess = function(e)
    {
        console.log('saved song=');
        console.log(song.toJSON());
    };
    request.onerror = musicDao.handleError;
};
musicDao.addArtist = function(artist)
{
    var trans = musicDao.db.transaction(['artist'], IDBTransaction.READ_WRITE, 0);
    var store = trans.objectStore('artist');
    var request = store.put(artist.toJSON(),artist.get('name'));

    request.onsuccess = function(e){console.log('saved artist='+artist.toJSON());console.log(e);};
    request.onerror = musicDao.handleError;
};

musicDao.deleteSong = function(id,success)
{
    var trans = musicDao.db.transaction(['song'], IDBTransaction.READ_WRITE, 0);
    var store = trans.objectStore('song');

    var request = store.delete(id);
    //todo (anton) also delete from filesystem
    request.onsuccess = function(e){success();};
    request.onerror = musicDao.handleError;
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