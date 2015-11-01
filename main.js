var socket = io();

var Application = function () {};
Application.prototype = {
    ui: {
        messages: "#messages",
        name    : "#name",
        msg     : "#m",
        online  : "#online"
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

        self.setUI();
        self.setNickname();
        self.getHistory();
        self.bindEvents();
    },

    setUI: function () {
        var self = this, ui = self.ui;
        self.$ui = {};
        $.each(ui, function (key, val) {
            self.$ui[key] = $(val);
        });
    },

    bindEvents: function () {
        var self = this, $ui = self.$ui;
        $('form').submit(function (e) {
            var text = $ui.msg.val(),
                name = $ui.name.val(),
                msg;
            if (text) {
                msg = {
                    name: name || 'Anonymous',
                    text: text
                };
                socket.emit('chat message', msg);
                $ui.msg.val('');
            }
            if (name) {
                localStorage.setItem('Nickname', name);
                self.setNickname();
            }
            return false;
        });
        socket.on('chat message', function (data) {
            self.addMessage(data);
            scrollToBottom();
            $(document).trigger("chat.message");
        });
        socket.on('online changed', self.onOnlineChanged.bind(self));

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
        msg.time = msg.time ? new Date(msg.time) : new Date();
        this.$ui.messages.append($('<li>').text('[' + msg.time.toLocaleString() + '] ' + msg.name + ': ' + msg.text));
    },

    onNewMessage: function () {
        var self = this;
        $('title').text('Чятик (новое сообщение)');
        self.notificationSound.play();
    },

    onOnlineChanged: function (onlineCount, eventType) {
        var self = this;
        self.$ui.online.text(onlineCount);
        if (eventType == 'disconnect') {
            self.$ui.online.parent().addClass('disconnect');
            setTimeout(function () {self.$ui.online.parent().removeClass('disconnect')}, 2000);
        }
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