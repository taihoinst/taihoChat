
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var socketio = require("socket.io");
var chatServer = require("./routes/server");
var top = require("./routes/topQuestion");
var fs = require('fs');

var app = express();

// all environments
app.set('port', 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use('/', routes);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
//app.use(express.static(path.join(__dirname, 'routes')));
//app.use('/static', express.static(__dirname + '/routes'));
//app.use('/js', express.static(path.join(__dirname, 'public/javascripts')));


// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.get('/', routes.index);
//app.get('/', routes.topQuestion);

/*
app.get("/", function (req, res) {
    res.sendfile(__dirname + "/clientChat.html");
});
*/

app.get('/about', routes.about);
app.get('/contact', routes.contact);
app.post('/upload', function (req, res) {
    fs.readFile(req.files.uploadFile.path, function (error, data) {

        var filePath = __dirname + "\\public\\uploadfile\\" + req.files.uploadFile.name;
        console.log('파일 경로 : ' + filePath);
        fs.writeFile(filePath, data, function (error) {
            if (error) {
                throw err;
            } else {
                res.send(filePath);
            }
        });
    });
});
var server = http.createServer(app).listen(app.get('port')||process.env.PORT, function () {
    console.log('Express server listening on port ' + app.get('port'));
});
var i = 0;
var io = socketio.listen(server);
console.log('socket.io 요청준비 완료');


//console.log('query : '+chatServer.ajax.query);

io.sockets.on('connection', function (socket) {
    //var path = process.cwd();
    //console.log('path : '+path);
    console.log('connection info : ', socket.request.connection._peername);

    console.log(top.topQuestionList());

    socket.on('message', function (message) {
        console.log('message : ', message.recepient);
        var jsArray;
        if (message.recepient == 'client') {
            console.log('client input : ' + message.text);

            //chatServer.top(message.text, function (err, results) {
            chatServer.luis(message.text, function (err, results) {

                console.log('server results : ' + results);
                //console.log('server server : ' + Object.keys(results).length);

                if (results == "" || results == null) {
                    socket.broadcast.emit('response', message);
                }
                else {
                    var resultJson = [];
                    var obj = {};
                    for (var n = 0; n < Object.keys(results).length; n++) {
                        var obj = {};
                        console.log('[' + n + '] : ' + results[n].PER + "% " + results[n].ANSWERVALUE);
                        obj["result"] = results[n].PER + "% " + results[n].ANSWERVALUE;
                        resultJson.push(obj);
                    };

                    console.log(resultJson);
                    message.js = resultJson;
                    socket.broadcast.emit('response', message);
                }
            });

        } else if (message.recepient == 'admin') {

            console.log('server send');
            socket.broadcast.emit('response', message);

        }
    });
});
