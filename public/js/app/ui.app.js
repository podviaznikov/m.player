var ui={};
$(function(){
    ui.AppView = Backbone.View.extend({
        el: $('body'),
        progress:$('#uploading_files_progress progress'),
        infoPanels:$('section.info_panel'),
        helpPanels:$('section.help_panel'),
        mainPanels:$('section.main_panel'),
        lastfmLoginBtn:$('#lastfm_login'),
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
                    'hideHelp','showFullScreen','hideFullScreen','keyPressed','showArtistBio',
                    'importMusicDirectory','importMusicFiles','processOneAudioFile','showLastfmLoginBtn');
        },
        showLastfmLoginBtn:function(){
            this.lastfmLoginBtn.show();
        },
        showArtistBio:function(artist){
            this.mainPanels.addClass('hidden');
            AppController.artistBioView.setArtistModel(artist);
            AppController.artistBioView.show();
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
            var target=e.originalEvent.dataTransfer||e.originalEvent.target,
                files = target.files;
            if(files && files.length>0){
               this.handleFileSelect(files); // handle FileList object.
            }
        },
        handleFileSelect:function(files){
            var self = this,
                fileProcessingFunctions=[];
                this.$('#file_upload_status_dialog').addClass('active');
            _.each(files,function(file,index){
                var bindedFunct=async.apply(self.processOneAudioFile,file,index,files.length);
                fileProcessingFunctions.push(bindedFunct);
            });
            async.series(fileProcessingFunctions,function(err, results){
                self.$('#file_upload_status_dialog').removeClass('active');
            });
        },
        //some refactoring should be done
        processOneAudioFile:function(file,index,filesAmount,callback){
            var percent = Math.floor(((index+1)/filesAmount)*100),
                progressElement = this.$(this.progress);
            this.$('#file_index').html(index);
            this.$('#total_files_amount').html(filesAmount);
            this.$('#uploading_files_progress header span').html(file.name);
            fs.read.fileAsBinaryString(file,function(readError,data,initialFile){
                if(readError){return;}
                ID3v2.parseFile(data,function(tags){
                    var song = new Song();
                    //fix track number
                    if(tags.track){
                        var slashIndex=tags.track.indexOf('/');
                        if(slashIndex>0){
                            tags.track=tags.track.substring(0,slashIndex);
                        }
                    }
                    tags.fileName=song.id+initialFile.extension();
                    tags.originalFileName=initialFile.name;
                    song.set(tags);
                    fs.write.file(initialFile,function(writeError){
                        if(!writeError){
                            song.save();
                            AppController.playlistView.songs.add(song);
                            progressElement.val(percent);
                            var artistName = song.get('artist'),
                                artist=AppController.libraryMenu.artists.forName(artistName);
                            if(!artist){
                                artist = new Artist({name:artistName});
                                dataService.getArtistImage(artist.get('name'),function(image){
                                    artist.set({image:image});
                                    artist.save();
                                    AppController.libraryMenu.artists.add(artist);
                                });
                            }
                            callback(null);
                        }
                    },song.get('fileName'));
               });
            });
        },
        showHelp:function(){
            this.isRegularMode=false;
            this.el.removeClass('fullscreen');
            this.helpPanels.removeClass('hidden');
            AppController.visualizationView.hide();
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
            var keyCode=event.keyCode,
                currentSong=undefined;
            if(AppController.playlistView){
                currentSong= AppController.playlistView.currentSong();
            }
            if(keyCode==40){
                //down arrow
                AppController.playlistView.next(false);
            } else if(keyCode==38){
                //up key
                AppController.playlistView.previous(false);
            }else if(keyCode==13){
                //enter
                AppController.playlistView.destroyFileURL();
                if(currentSong){
                    currentSong.view.playSong();
                }
            }else if(keyCode==32){
                //space
                AppController.playerCtrl.togglePause();
            }else if(keyCode==46){
                //delete-delete song from playlist
               if(currentSong){
                    currentSong.view.remove();
                }
            }else if(keyCode==27){
                //escape-comeback to the normal view
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
                dataService.getAlbumPoster(this.model.get('artist'),this.model.get('album'),this.renderAlbumPoster);
            }
            return this;
        }
    });

    ui.ArtistBioView = Backbone.View.extend({
        el: $('#artist_bio'),
         initialize:function(){
            _.bindAll(this,'render','show','hide','setArtistModel','renderArtistBio');
        },
        setArtistModel:function(artist)
        {
            this.model=artist;
        },
        show:function(){
            this.el.show();
            this.render();
        },
        hide:function(){
            this.el.hide();
        },
        render:function(){

           if(this.model){
                dataService.getArtistBio(this.model.get('name'),this.renderArtistBio);
           }
           return this;
        },
        renderArtistBio:function(data)
        {
            var html = unescape(data.summary);
            $(this.el).html(html);
        }
    });
});