var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var MsgHistory = require('./history');
var exec = require("child_process").exec;

function getIndex (request, response) {
	response.sendFile(__dirname + '/index.html');
}
app.get('/', getIndex);
app.get('/index.html', getIndex);

app.get('/main.js', function(req, res){
  res.sendFile(__dirname + '/main.js');
});

app.get('/main.css', function(req, res){
  res.sendFile(__dirname + '/main.css');
});

app.get('/getHistory', function(req, res){
	MsgHistory.get().then(function (content) {
	  	res.send(JSON.stringify(content));
	});
});

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
  	MsgHistory.save(msg);
  	io.emit('chat message', msg);
  });
});

app.get('/updateFromSVN', function(req, res){
  exec('svn up');
  res.send('updated');
});

http.listen(9090, function(){
  console.log('listening on *:3000');
});

function showMemoryUsage () {
  console.log(process.memoryUsage());
  setTimeout(function () {
    showMemoryUsage();
  }, 1000);  
}