var util = require('util'),
    express = require('express'),
    connect = require('connect'),
    app = express.createServer();

app.configure(function()
{
    app.use(connect.favicon(__dirname + '/public/16.png'));
    //logger
    app.use(express.logger());
    //public folder for static files
    app.use(express.static(__dirname + '/public'));
});

app.listen(8084);

util.log('started on 8084');