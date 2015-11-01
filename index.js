var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var MsgHistory = require('./history');
var router = require('./router')(express.Router(), MsgHistory, io);
var onlineCount = 0;

io.on('connection', function (socket) {
    socket.on('chat message', function (msg) {
        MsgHistory.save(msg);
        io.emit('chat message', msg);
    });
    socket.on('disconnect', function () {
        io.emit('online changed', --onlineCount, 'disconnect');
    });
    io.emit('online changed', ++onlineCount, 'connect');
});
http.listen(9090, function () {
    console.log('listening on *:9090');
});

app.use(router);