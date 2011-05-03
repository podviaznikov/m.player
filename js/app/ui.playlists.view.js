// m.Player
// (c) 2011 Anton Podviaznikov, Enginimation Studio (http://enginimation.info).
// m.player may be freely distributed under the MIT license.
// For all details and documentation:
// https://github.com/podviaznikov/m.player
"use strict";
var global = window;
$(function()
{
    ui.PlayListMenuView = Backbone.View.extend(
    {
        className:'lib-item-data box',
        tagName: 'article',
        tpl:$('#saved_playlist_tpl').html(),
        events:
        {
            'click':'selectPlayList',
            'click .delete_playlist':'deletePlaylist'
        },
        initialize:function()
        {
            _.bindAll(this, 'addOne', 'addAll', 'render','selectPlayList','deletePlaylist');
            this.model.bind('change',this.render);
            this.model.view=this;
        },
        render: function()
        {
            var html = _.template(this.tpl,
            {
                image:'css/images/no_picture.png',
                name:this.model.get('name'),
                songsCount:this.model.get('songs').length
            });
            $(this.el).html(html);
            return this;
        },
        selectPlayList: function()
        {
            $('.lib-item-data').removeClass('selected-lib-item');
            $(this.el).addClass('selected-lib-item');
            AppController.songsView.showPlayList(this.model);
        },
        deletePlaylist:function()
        {
            this.model.destroy();
            this.$(this.el).remove();
        }
    });
});
