var Song = require("./models").Song;
var Artist = require("./models").Artist;

var AppView = exports.AppView = Backbone.View.extend({
    el: $('body'),
    progress:$('#uploading_files_progress progress'),
    helpScreen:$('#help_screen'),
    mainScreen:$('#main_screen'),
    isRegularMode:true,
    dropFolderCtrl:$('#drop_folder'),
    dropFilesCtrl:$('#drop_files'),
    fileUploadStatusDialog:$('#file_upload_status_dialog'),
    events:{
        'keyup':'keyPressed',
        'dragover':'dragOverFiles',
        'drop .main_panel':'dropFiles',
        'change #drop_files':'dropFiles',
        'change #drop_folder':'dropFiles',
        'click #import_songs_directory':'importMusicDirectory',
        'click #import_songs_files':'importMusicFiles',
    },
    initialize:function(){
        _.bindAll(this,'dragOverFiles','dropFiles','handleFileSelect','showHelp',
                'hideHelp','showFullScreen','hideFullScreen','keyPressed',
                'importMusicDirectory','importMusicFiles','processOneAudioFile');
    },
    importMusicDirectory:function(){
        this.dropFolderCtrl.click();
    },
    importMusicFiles:function(){
        this.dropFilesCtrl.click();
    },
    dragOverFiles:function(e){
        e.stopPropagation();
        e.preventDefault();
    },
    dropFiles:function(e){
        e.stopPropagation();
        e.preventDefault();
        //getting from file input or dragged content
        var target=e.originalEvent.dataTransfer||e.originalEvent.target,
            files=target.files;
        if(files && files.length>0){
           this.handleFileSelect(files); // handle FileList object.
        }
    },
    handleFileSelect:function(files,skipWrite){
        var self=this,
            fileProcessingFunctions=[];
        this.fileUploadStatusDialog.addClass('active');
        _.each(files,function(file,index){
            var bindedFunct=async.apply(self.processOneAudioFile,file,index,files.length,skipWrite);
            fileProcessingFunctions.push(bindedFunct);
        });
        async.series(fileProcessingFunctions,function(err,results){
            self.fileUploadStatusDialog.removeClass('active');
        });
    },
    //todo(anton) some refactoring should be done. get dom elements from here
    processOneAudioFile:function(file,index,filesAmount,skipWrite,callback){
        var percent=Math.floor(((index+1)/filesAmount)*100),
            progressElement=this.$(this.progress);
        this.$('#file_index').html(index);
        this.$('#total_files_amount').html(filesAmount);
        this.$('#uploading_files_progress header span').html(file.name);
        fs.read.fileAsBinaryString(file,function(readError,data,initialFile){
            if(readError){return;}
            AppController.metadataParser.parse(initialFile.name,data,function(tags){
                console.log('Tags',tags);
                var song=new Song();
                tags.fileName=song.id+initialFile.extension();
                tags.originalFileName=initialFile.name;
                song.set(tags);
                progressElement.val(percent);
                if(skipWrite){
                    AppController.appView.saveSong(song,callback);
                }
                else{
                    fs.write.file(initialFile,function(writeError){
                        if(!writeError){
                            AppController.appView.saveSong(song,callback);
                            AppController.playlistView.songs.add(song);
                        }
                    },song.get('fileName'));
                }
           });
        });
    },
    saveSong:function(song,callback){
        song.save();
        var artistName=song.get('artist'),
            artist=AppController.libraryMenu.artists.forName(artistName);
        if(!artist){
            artist=new Artist({name:artistName});
            artist.findImage(function(){
                AppController.libraryMenu.artists.add(artist);
                callback(null);
            });
        }
        else{
            //if artist was deleted: mark it as undeleted
            artist.set({isDeleted:false});
            var songsCount=artist.get('songsCount')||0;
            artist.set({songsCount:songsCount+1});
            artist.songs.add(song,{silent:true});
            artist.save();
            artist.change();
            callback(null);
        }
    },
    showHelp:function(){
        this.isRegularMode=false;
        this.el.removeClass('fullscreen');
        this.helpScreen.removeClass('hidden');
        this.mainScreen.addClass('hidden');
        AppController.visualizationView.hide();
    },
    hideHelp:function(){
        this.isRegularMode=true;
        this.mainScreen.removeClass('hidden');
        this.helpScreen.addClass('hidden');
    },
    showFullScreen:function(){
        this.hideHelp();
        this.mainScreen.addClass('hidden');
        this.el.addClass('fullscreen');
        AppController.visualizationView.show();
    },
    hideFullScreen:function(){
        this.el.removeClass('fullscreen');
        if(this.isRegularMode){
            this.mainScreen.removeClass('hidden');
        }
        else{
            this.helpScreen.removeClass('hidden');
        }
        AppController.visualizationView.hide();
    },
    keyPressed:function(event){
        var keyCode=event.keyCode,
            currentSong;
        if(AppController.playlistView){
            currentSong=AppController.playlistView.currentSong();
        }
        if(keyCode===40){
            //down arrow
            AppController.playlistView.next(false);
        }
        else if(keyCode===38){
            //up key
            AppController.playlistView.previous(false);
        }
        else if(keyCode===13){
            //enter
            if(currentSong){
                currentSong.view.playSong();
            }
        }
        else if(keyCode===32){
            //space
            AppController.playerCtrl.togglePause();
        }
        else if(keyCode===46){
            //delete-delete song from playlist
           if(currentSong){
                currentSong.view.remove();
            }
        }
        else if(keyCode===27){
            //escape-comeback to the normal view
            AppController.playerCtrl.turnOffFullScreen();
            AppController.playerCtrl.turnOffHelpMode();
        }
    }
});

var VisualizationView = exports.VisualizationView = Backbone.View.extend({
    el:$('#playing_visualization'),
    tplId:'visualization_tpl',
    show:function(){
        this.el.show();
        this.render();
    },
    hide:function(){
        this.el.hide();
    },
    render:function(){
        var self=this,
            song=AppController.playlistView.currentSong();
        if(song){
            dataService.getAlbumPoster(song.get('artist'),song.get('album'),function(image){
                self.renderTpl({image:image});
            });
        }
        return this;
    }
});

