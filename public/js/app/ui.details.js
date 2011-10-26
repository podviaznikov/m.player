//2nd column view
var DetailsView = exports.DetailsView = Backbone.View.extend({
  el:$('#filtered_lib'),
  libDetailsPanel:$('#filtered_lib_content'),
  artistBioPanel:$('#artist_bio'),
  events:{
      'dragstart':'handleDragStart'
  },
  initialize:function(){
      Backbone.View.prototype.initialize.apply(this,arguments);
      _.bindAll(this, 'showAlbums','showAlbum','showPlayList','handleDragStart','showBio','hideBio');
      this.artistBioView=new ArtistBioView();
  },
  showBio:function(artist){
      this.artistBioPanel.show();
      this.artistBioView.setArtistModel(artist);
      this.artistBioView.render();
      this.libDetailsPanel.hide();
  },
  hideBio:function(){
      this.artistBioPanel.hide();
      this.artistBioView.clear();
      this.libDetailsPanel.show();
      this.libDetailsPanel.empty();
  },
  //AlbumList and array of songs
  showAlbums:function(albumsModels,songs){
      this.hideBio();
      if(albumsModels){
          albumsModels.each(this.showAlbum);
      }
      this.songs=songs;
  },
  showAlbum:function(albumModel){
      this.hideBio();
      //todo (anton) check this!!!
      this.songs=albumModel.get('songs');
      var albumView=new AlbumView({model:albumModel});
      this.libDetailsPanel.append(albumView.render().el);
  },
  showPlayList:function(playList){
      this.hideBio();
      var playListView=new PlayListFullView({model:playList});
      this.libDetailsPanel.append(playListView.render().el);
  },
  handleDragStart:function(e){
      var event=e.originalEvent,
          dataTransferObj=event.dataTransfer,
          songId=event.srcElement.dataset.id;
      dataTransferObj.effectAllowed='move';

      if(this.songs){
          var song=this.songs.get(songId),
              dataTransfer=DataTransfer.create('song',song);
          dataTransferObj.setData('text/plain',dataTransfer.toString());
      }
  }
});

var ArtistBioView=Backbone.View.extend({
  el: $('#artist_bio'),
  tplId:'artist_bio_tpl',
  initialize:function(){
      Backbone.View.prototype.initialize.apply(this,arguments);
     _.bindAll(this,'setArtistModel','renderArtistBio','clear');
  },
  setArtistModel:function(artist){
     this.model=artist;
  },
  render:function(){
      if(this.model){
          dataService.getArtistBio(this.model.get('name'),this.renderArtistBio);
      }
      return this;
  },
  renderArtistBio:function(data){
      this.renderTpl({
          bio:unescape(data.summary),
          profiles:data.profile||{}
      });
  },
  clear:function(){
      $(this.el).html('');
  }
});

var AlbumView=Backbone.View.extend({
  className:'lib_item_full_info_panel',
  tagName:'article',
  initialize:function(){
      Backbone.View.prototype.initialize.apply(this,arguments);
      _.bindAll(this,'addSong');
  },
  render:function(){
      this.albumInfoView=new AlbumInfoView({model:this.model});
      $(this.el).append(this.albumInfoView.render().el);
      if(this.model.get('songs')){
          this.model.get('songs').each(this.addSong);
      }
      return this;
  },
  addSong:function(song,key){
      var view=new SongView({model:song,key:key,songs:this.model.get('songs')});
      song.albumView=view;
      $(this.el).append(view.render().el);
  }
});

var PlayListFullView=Backbone.View.extend({
  className:'lib_item_full_info_panel',
  tagName:'article',
  tplId:'detailed_playlist_info_tpl',
  events:{
      'click':'playSongs'
  },
  initialize: function(){
      Backbone.View.prototype.initialize.apply(this,arguments);
      _.bindAll(this,'addSong','renderPlayListInfo','playSongs');
  },
  render:function(){
      this.model.findImage(this.renderPlayListInfo);
      return this;
  },
  renderPlayListInfo:function(image){
      this.renderTpl({
          image:image,
          name:this.model.get('name')
      });
      _.each(this.model.get('songs'),this.addSong);
  },
  addSong:function(songData,key){
      var song=new Song(songData),
          view=new SongView({
              model:song,
              key:key,
              songs:this.model.get('songs'),
              playList:this.model
          });
      song.albumView=view;
      $(this.el).append(view.render().el);
  },
  playSongs:function(){
      AppController.playlistView.setSongsAndPlay(this.model.get('songs'));
  }
});

var AlbumInfoView=Backbone.View.extend({
  className:'detailed_album_info_panel box',
  tagName:'section',
  tplId:'detailed_album_info_tpl',
  events:{
      'click':'playSongs'
  },
  initialize:function(){
      Backbone.View.prototype.initialize.apply(this,arguments);
      _.bindAll(this,'renderAlbumInfo','playSongs');
  },
  renderAlbumInfo:function(data){
      this.renderTpl({
          image:data.image,
          name:this.model.get('name'),
          releaseDate:data.releaseDate
      });
  },
  render:function(){
      dataService.getAlbumInfo(this.model.get('artist'),this.model.get('name'),this.renderAlbumInfo);
      return this;
  },
  playSongs:function(){
      AppController.playlistView.setSongsAndPlay(this.model.get('songs'));
  }
});

var SongView=Backbone.View.extend({
  className:'song-data',
  tplId:'song_tpl',
  events:{
      'click':'selectSong',
      'click .delete_album_song':'deleteSong',
      'dblclick .song':'playSongs'
  },
  initialize:function(){
      Backbone.View.prototype.initialize.apply(this,arguments);
      _.bindAll(this,'selectSong','deleteSong','onDeleteSong','playSongs','render');
  },
  render:function(){
      this.el.draggable=true;
      this.el.dataset.songname=this.model.get('title');
      this.el.dataset.id=this.model.id;
      this.el.id=this.model.id;
      this.renderTpl({
          track:this.model.get('track')||this.options.key+1,
          title:this.model.get('title')
      });
      return this;
  },
  selectSong:function(){
      $('.song-data').removeClass('selected_song');
      $(this.el).addClass('selected_song');
  },
  deleteSong:function(){
      this.model.bind('destroy',this.onDeleteSong);
      this.model.remove();
  },
  onDeleteSong:function(){
      var view=this.model.albumView;
      if(view){
          view.remove();
      }
  },
  playSongs:function(){
      var songs=this.options.songs;
      this.selectSong();
      AppController.playlistView.setSongsAndPlay(songs);
      if(this.options.playList){
          AppController.playlistView.setPlayListModel(this.options.playList);
      }
      else{
          AppController.playlistView.removePlayListModel();
      }
  }
});

