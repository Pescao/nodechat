var socket = io();

var Application = function () {};
Application.prototype = {
    ui: {
        messages: "#messages",
        name    : "#name",
        msg     : "#m"
    },
    $ui: {
        messages: $("#messages"),
        name    : $("#name"),
        msg     : $("#m")
    },
    calls: {
        getHistory: function () {
            return $.ajax({
                type: 'GET',
                url : 'http://82.117.250.47:9090/getHistory'
            });
        }
    },
    initialize: function () {
        var self = this;

        self.setNickname();
        self.getHistory();
        self.bindEvents();
    },
    bindEvents: function () {
        var self = this, $ui = self.$ui;
        $('form').submit(function () {
            var msg = $ui.msg.val(),
                name = $ui.name.val();
            if (msg) {
                msg = {
                    name: name || 'Anonymous',
                    text: msg
                };
                socket.emit('chat message', msg);
                $ui.msg.val('');
            }
            if (name) {
                localStorage.setItem('Nickname', name);
                $ui.name.attr('disabled', '');
            }
            return false;
        });
        socket.on('chat message', function (data) {
            self.addMessage(data);
            $(window).scrollTop($('body').height());
        });
    },
    addMessage: function (msg) {
        var self = this, $ui = self.$ui,
            time = new Date();
        if (msg.time) {
            time = new Date(msg.time);
        }
        $ui.messages.append($('<li>').text('[' + time.toLocaleString() + '] ' + msg.name + ': ' + msg.text));
    },
    setNickname: function () {
        var self = this, $ui = self.$ui,
            nick = localStorage.getItem('Nickname');
        if (nick) {
            $ui.name.val(nick).attr('disabled', '');
        } else {
            $ui.name.focus();
        }
    },
    getHistory: function () {
        var self = this;
        $.when(self.calls.getHistory()).then(function (result) {
            var history;
            try {
                history = JSON.parse(result);
                history.messages.forEach(function (msg) {
                    self.addMessage(msg);
                });
            } catch (e) {
                console.log(e)
            }
        });
    }
};

var app = new Application();
app.initialize();