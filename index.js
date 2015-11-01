var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var MsgHistory = require('./history');
var child_process = require("child_process");
var onlineCount = 0;

function getIndex(request, response) {
    response.sendFile(__dirname + '/index.html');
}
app.get(/^\/(index(\.html|)|)$/i, getIndex);

app.get('/main.js', function (req, res) {
    console.log(req);
    res.sendFile(__dirname + '/main.js');
});
app.get(/(\/bla\/[\/a-z0-9-_]+)\.js/i, function (req, res) {
    res.send(JSON.stringify(req));
});
app.get('/main.css', function (req, res) {
    res.sendFile(__dirname + '/main.css');
});
app.get('/assets/audio/notification.mp3', function (req, res) {
    res.sendFile(__dirname + '/assets/audio/notification.mp3');
});
app.get('/getHistory', function (req, res) {
    MsgHistory.get().then(function (content) {
        res.send(JSON.stringify(content));
    });
});
app.get('/updateFromRepo', function (req, res) {
    console.log('updating from repo');
    var pull = child_process.spawn('git', ['pull']),
        output = {stdout: [], stderr: []};

    pull.stdout.on('data', function (data) {
        console.log('pull stdout: ' + data);
        output.stdout.push('pull stdout: ' + data);
    });
    pull.stderr.on('data', function (data) {
        console.log('pull stderr: ' + data);
        output.stderr.push('pull stderr: ' + data);
    });
    io.emit('code updated');
    res.send(JSON.stringify(output));
});

io.on('connection', function (socket) {
    socket.on('chat message', function (msg) {
        MsgHistory.save(msg);
        io.emit('chat message', msg);
    });
    io.emit('online changed', ++onlineCount, 'connect');
});
io.on('disconnection', function (socket) {
    io.emit('online changed', --onlineCount, 'disconnect');
});
http.listen(9090, function () {
    console.log('listening on *:3000');
});

(function () {
    var oldSpawn = child_process.spawn;
    child_process.spawn = function mySpawn() {
        //console.log('spawn called');
        //console.log(arguments);
        return oldSpawn.apply(this, arguments);
    };
})();