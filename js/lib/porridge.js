/**
 * License
 *
 *(The MIT License)
 *
 * Copyright (c) 2011 Anton Podviaznikov <podviaznikov@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
"use strict";
var global = this;
var indexedDB = global.indexedDB || global.webkitIndexedDB;
var IDBTransaction = global.IDBTransaction || global.webkitIDBTransaction;
var IDBKeyRange = global.IDBKeyRange || global.webkitIDBKeyRange;
var porridge=
{
    db:null,
    log:function(e)
    {
        console.log(e);
    },
    info:function(e)
    {
        console.info(e);
    },
    init:function(config,handleSuccess,handleError)
    {
        var request = indexedDB.open(config.dbName,config.dbDescription);
        var version = config.dbVersion;
        request.onsuccess = function(e)
        {
            var db = e.target.result;
            porridge.db = db;
            // We can only create Object stores in a setVersion transaction;
            if(version!= db.version)
            {
                var setVersionReq = db.setVersion(version);
                // onsuccess is the only place we can create Object Stores
                setVersionReq.onfailure = handleError||porridge.log;
                setVersionReq.onsuccess = function(e)
                {
                    //create store store
                    for(var i=0;i<config.stores.length;i++)
                    {
                        var storeDef = config.stores[i];
                        var store = db.createObjectStore(storeDef.name,storeDef.key,true);
                        if(storeDef.indexes)
                        {
                            for(var k=0;k<storeDef.indexes.length;k++)
                            {
                                var indexDef=storeDef.indexes[k];
                                store.createIndex(indexDef.name, indexDef.name);
                            }
                        }
                    }
                    porridge.log('initialized db');
                    handleSuccess();
                };
            }
            else
            {
                handleSuccess();
            }

        };
        request.onfailure = handleError||this.log;

    },
    all:function(entityName,handleOne,handleAll,handleError)
    {
        var trans = this.db.transaction(entityName, IDBTransaction.READ_WRITE, 0);
        var store = trans.objectStore(entityName);
        // Get everything from the store;
        var request = store.openCursor();

        request.onsuccess = function(e)
        {
            var cursor = e.result ||       // The cursor is either in the event
                e.target.result;           // ...or in the request object.
            if (!cursor)                   // No cursor means no more results
            {
                if(handleAll)              //execute callback when all records retrieved
                {
                    handleAll();
                }
                return;
            }
            var object = cursor.value;      // Get the matching record
            handleOne(object);              // Pass it to the callback
            cursor.continue();             // Ask for the next matching record
        };
        request.onerror = handleError||this.log;
    },
    save:function(entityName,entity,key,handleError)
    {
        var trans = this.db.transaction([entityName], IDBTransaction.READ_WRITE, 0);
        var store = trans.objectStore(entityName);
        var request = store.put(entity,key);

        request.onsuccess = porridge.info;
        request.onerror = handleError||this.log;
    },
    remove:function(entityName,id,success,handleError)
    {
        var trans = this.db.transaction(entityName, IDBTransaction.READ_WRITE, 0);
        var store = trans.objectStore(entityName);

        var request = store.delete(id);
        request.onsuccess = success;
        request.onerror = handleError||this.log;
    },
    allByKey:function(entityName,keyName,keyValue,handleOne,handleAll,handleError)
    {
        var trans = this.db.transaction(entityName, IDBTransaction.READ_WRITE, 0);
        var store = trans.objectStore(entityName);
        var index = store.index(keyName);
        var range = new IDBKeyRange.only(keyValue);
        // Get everything in the store;
        var request = index.openCursor(range);

        request.onsuccess = function(e)
        {
            var cursor = e.result ||       // The cursor is either in the event
                e.target.result;           // ...or in the request object.
            if (!cursor)                  // No cursor means no more results
            {
                if(handleAll)              //execute callback when all records retrieved
                {
                    handleAll();
                }
                return;
            }
            var object = cursor.value;      // Get the matching record
            handleOne(object);            // Pass it to the callback
            cursor.continue();             // Ask for the next matching record
        };

        request.onerror = handleError||this.log;
    }


}
