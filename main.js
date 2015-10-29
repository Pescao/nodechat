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
    notificationSound: new Audio('./assets/audio/notification.mp3'),
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
            scrollToBottom();
            $(document).trigger("chat.message");
        });

        socket.on('code updated', function () {
            // not sure that we need it
            //location.reload();
        });

        $(window).blur(function (e) {
            $(document).on("chat.message", self.onNewMessage.bind(self));
            $(window).on('focus', function (e) {
                $('title').text('Чятик');
                $(window).off('focus');
                $(document).off("chat.message");
            });
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
    onNewMessage     : function () {
        var self = this;
        $('title').text('Чятик (новое сообщение)');
        self.notificationSound.play();

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
                scrollToBottom();
            } catch (e) {
                console.log(e)
            }
        });
    }
};

var app = new Application();
app.initialize();

function scrollToBottom() {
    $(window).scrollTop($('body').height());
}