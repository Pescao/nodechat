var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var MsgHistory = require('./history');
var child_process = require("child_process");

function getIndex(request, response) {
    response.sendFile(__dirname + '/index.html');
}
app.get('/', getIndex);
app.get('/index.html', getIndex);
app.get('/main.js', function (req, res) {
    res.sendFile(__dirname + '/main.js');
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
    res.send(JSON.stringify(output));
});

io.on('connection', function (socket) {
    socket.on('chat message', function (msg) {
        MsgHistory.save(msg);
        io.emit('chat message', msg);
    });
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