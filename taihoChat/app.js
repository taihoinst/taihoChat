
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var socketio = require("socket.io");

var app = express();

// all environments
app.set('port', 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.get('/', routes.index);
/*
app.get("/", function (req, res) {
    res.sendfile(__dirname + "/clientChat.html");
});
*/

app.get('/about', routes.about);
app.get('/contact', routes.contact);

var server = http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
var i = 0;
var io = socketio.listen(server);
console.log('socket.io 요청준비 완료');

io.sockets.on('connection', function(socket) {
    console.log('connection info : ', socket.request.connection._peername);

    socket.on('message', function (message) {
        //console.log('message : ', message.recepient);
        var jsArray;
        if (message.recepient == 'client') {
            console.log('admin');
            jsArray = [{ result: 'test' + (i++) }, { result: 'test' + (i++) }, { result: 'test' + (i++) }];
            message.js = jsArray;
        }
        socket.broadcast.emit('response', message);
    });
});
