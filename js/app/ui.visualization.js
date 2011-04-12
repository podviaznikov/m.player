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
        tpl:$('#visualization_tpl').html(),

        initialize: function()
        {
            var self=this;
            this.bind('song:select',this.selectSong);
        },
        selectSong:function(song)
        {
            this.model = song;
            this.render();
        },
        render:function()
        {
            var self = this;
//            AppController.lastfm.album.getInfo(
//            {
//                artist: this.model.get('artist'),
//                album: this.model.get('album')
//            },
//            {
//                success: function(data)
//                {
//                    console.log(data);
//                    var image = data.album.image[4]['#text'];
//                    var html = _.template(self.tpl,
//                    {
//                        image:image
//                    });
//                    $(self.el).html(html);
//
//                },
//                error: function(code, message)
//                {
//                    console.log(message);
//                }
//            });

            return this;
        }

    });

});
