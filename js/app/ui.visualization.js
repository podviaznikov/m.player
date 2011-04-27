// m.Player
// (c) 2011 Anton Podviaznikov, Enginimation Studio (http://enginimation.info).
// m.player may be freely distributed under the MIT license.
// For all details and documentation:
// https://github.com/podviaznikov/m.player
"use strict";
var global = window;
$(function()
{
    ui.VisualizationView = Backbone.View.extend(
    {
        el: $('#playing_visualization'),
        tpl: $('#visualization_tpl').html(),

        initialize: function()
        {
            _.bindAll(this,'selectSong','render','show','hide','renderAlbumPoster');
        },
        selectSong:function(song)
        {
            this.model = song;
        },
        show:function()
        {
            this.el.show();
            this.render();
        },
        hide:function()
        {
            this.el.hide();
        },
        renderAlbumPoster:function(image)
        {
            var html = _.template(this.tpl,
            {
                image:image
            });
            $(this.el).html(html);
        },
        render:function()
        {
            if(this.model)
            {
                lastFM.getAlbumPoster(this.model.get('artist'),this.model.get('album'),this.renderAlbumPoster);
            }
            return this;
        }

    });

});
