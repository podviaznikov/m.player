// m.player
// (c) 2011 Enginimation Studio (http://enginimation.com).
// m.player may be freely distributed under the MIT license.
// For all details and documentation:
// https://github.com/podviaznikov/m.player
"use strict";
var ui={};
$(function(){
    ui.AppView = Backbone.View.extend({
        el: $('body'),
        infoPanels:$('section.info_panel'),
        helpPanels:$('section.help_panel'),
        mainPanels:$('section.main_panel'),
        isRegularMode:true,
        events:{
            'keyup':'keyPressed',
            'dragover':'dragOverFiles',
            'drop .main_panel':'dropFiles',
            'change #drop_files':'dropFiles',
            'change #drop_folder':'dropFiles',
            'click #import_songs_directory':'importMusicDirectory',
            'click #import_songs_files':'importMusicFiles'
        },
        initialize:function(){
            _.bindAll(this,'dragOverFiles','dropFiles','handleFileSelect','showHelp',
                    'hideHelp','showFullScreen','hideFullScreen','keyPressed','parseFilesMetaData','saveDataToLib',
                    'importMusicDirectory','importMusicFiles')
        },
        importMusicDirectory:function(){
            this.$('#drop_folder').click();
        },
        importMusicFiles:function(){
            this.$('#drop_files').click();
        },
        dragOverFiles:function(e){
            e.stopPropagation();
            e.preventDefault();
        },
        dropFiles:function(e){
            e.stopPropagation();
            e.preventDefault();
            //getting from file input or dragged content
            var target=e.originalEvent.dataTransfer||e.originalEvent.target;
            var files = target.files;
            if(files && files.length>0){
               this.handleFileSelect(files); // handle FileList object.
            }
        },
        handleFileSelect:function(files){
            var audioFiles=_.select(files, function(file){return file.type.match('audio/mp3')});
            var filesContents=[];
            var parseFiles = _.after(audioFiles.length,this.parseFilesMetaData);
            _.each(audioFiles,function(file,index){
                fs.read.fileAsBinaryString(file,function(readError,data,initialFile){
                    if(readError){return;}
                    filesContents[index]=data;
                    parseFiles(filesContents,audioFiles);
                });
            });
        },
        parseFilesMetaData:function(filesContents,audioFiles){
            var songs=new SongsList;
            var files=audioFiles;
            var saveToLib = _.after(files.length,this.saveDataToLib);
            _.each(filesContents,function(data,index){
                ID3v2.parseFile(data,function(tags){
                    var initialFile = files[index];
                    var song = new Song();
                    tags.fileName=song.id+initialFile.extension();
                    tags.originalFileName=initialFile.name;
                    song.set(tags);
                    songs.add(song);
                    saveToLib(songs,files);
                });
            });
        },
        saveDataToLib:function(songs,audioFiles){
            songs.each(function(song,index){
                var initialFile=audioFiles[index];
                fs.write.file(initialFile,function(writeError){
                    if(!writeError){
                        song.save();
                        AppController.playlistView.songs.add(song);
                    }
                },song.get('fileName'));
            });
            var allArtists=songs.map(function(song){
                return song.get('artist');
            });
            var artists=_.unique(allArtists);
            _.each(artists,function(artistName){
                var artist=AppController.libraryMenu.artists.findByName(artistName);
                if(!artist){
                    artist = new Artist({name:artistName});
                    lastFM.getArtistImage(artist.get('name'),function(image){
                        artist.set({image:image});
                        artist.save();
                        AppController.libraryMenu.artists.add(artist);
                    });
                }
            });
        },
        showHelp:function(){
            this.isRegularMode=false;
            this.el.removeClass('fullscreen');
            this.infoPanels.addClass('hidden');
            this.helpPanels.removeClass('hidden');
        },
        hideHelp:function(){
            this.isRegularMode=true;
            this.infoPanels.removeClass('hidden');
            this.helpPanels.addClass('hidden');
        },
        showFullScreen:function(){
            this.infoPanels.addClass('hidden');
            this.el.addClass('fullscreen');
            AppController.visualizationView.show();
        },
        hideFullScreen:function(){
            this.el.removeClass('fullscreen');
            if(this.isRegularMode){
                this.mainPanels.removeClass('hidden');
            }else{
                this.helpPanels.removeClass('hidden');
            }
            AppController.visualizationView.hide();
        },
        keyPressed:function(event)
        {
            var keyCode = event.keyCode;
            if(keyCode==40){//down arrow
                AppController.playlistView.next(false);
            } else if(keyCode==38){//up key
                AppController.playlistView.previous(false);
            }else if(keyCode==13){//enter
                AppController.playlistView.destroyFileURL();
                AppController.playlistView.currentSong().view.playSong();
            }else if(keyCode==32){//space
                AppController.playerCtrl.togglePause();
            }else if(keyCode==46){//delete
                //delete song from playlist
                AppController.playlistView.currentSong().view.remove();
            }else if(keyCode==27){//escape
                //comeback to the normal view
                AppController.playerCtrl.turnOffFullScreen();
                AppController.playerCtrl.turnOffHelpMode();
            }
        }
    });

    ui.VisualizationView = Backbone.View.extend({
        el: $('#playing_visualization'),
        tpl: $('#visualization_tpl').html(),
        initialize:function(){
            _.bindAll(this,'selectSong','render','show','hide','renderAlbumPoster');
        },
        selectSong:function(song){
            this.model = song;
        },
        show:function(){
            this.el.show();
            this.render();
        },
        hide:function(){
            this.el.hide();
        },
        renderAlbumPoster:function(image){
            var html = _.template(this.tpl,{image:image });
            $(this.el).html(html);
        },
        render:function(){
            if(this.model){
                lastFM.getAlbumPoster(this.model.get('artist'),this.model.get('album'),this.renderAlbumPoster);
            }
            return this;
        }
    });
});