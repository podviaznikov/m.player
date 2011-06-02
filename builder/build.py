# JSBuilder example

# project name (from the root folder)
copyright = '(c) 2011 Enginimation Studio (http://enginimation.com). May be freely distributed under the MIT license.'
max_js = 'public/js/app.js'
min_js = 'public/js/app.min.js'

# file list (from the root/src folder)
files = [
    "/js/app/controller.js",
    "/js/app/models.js",
    "/js/app/ui.app.js",
    "/js/app/ui.library.js",
    "/js/app/ui.playlist.js",
    "/js/app/ui.songslist.js",
    "/js/app/ui.player.js"
]

# execute the task
import JSBuilder
JSBuilder.compile(
    copyright,
    max_js,
    min_js,
    files
)

# let me read the result ...
import time
time.sleep(2)