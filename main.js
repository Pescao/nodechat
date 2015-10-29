var Application = function () {
    this.ui = {
        messages: "#messages",
        name: "#name",
        msg: "#m"
    }
};
var socket = io();
var calls = {
    getHistory: function () {
        return $.ajax({
            type: 'GET',
            url: 'http://82.117.250.47:9090/getHistory'
        });
    }
};

Application.prototype.initialize = function () {
    var self = this, ui = self.ui,
        nick = localStorage.getItem('Nickname');
    if (nick) {
        $(ui.name).val(nick).attr('disabled', '');
    } else {
        $(ui.name).focus();
    }

    $.when(calls.getHistory()).then(function (result) {
        var history;
        try {
            history = JSON.parse(result);
            history.messages.forEach(function (msg) {
                self.addMessage(msg);
            });
        } catch(e) { console.log(e) }
    });
};

Application.prototype.addMessage = function (msg) {
    var time = new Date();
    if (msg.time) {
        time = new Date(msg.time);
    }
    $('#messages').append($('<li>').text('['+ time.toLocaleString() + '] ' + msg.name + ': ' + msg.text));
};

$('form').submit(function(){
    var self = app, ui = self.ui,
        msg = $(ui.msg).val(),
        name = $(ui.name).val();
    if (msg) {
        msg = {
            name: name || 'Anonymous',
            text: msg
        };
        socket.emit('chat message', msg);
        $('#m').val('');
    }
    if (name) {
        localStorage.setItem('Nickname', name);
        $('#name').attr('disabled', '');
    }
    return false;
});

socket.on('chat message', function(data){
    app.addMessage(data);
});

var app = new Application();
app.initialize();