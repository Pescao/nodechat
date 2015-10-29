var History = function () {};
var fs = require('fs');

History.prototype.get = function () {
    return new Promise(function (resolve, reject) {
        var lastHistory = {messages: []};
        fs.readFile('history.json', function (err, content) {
            if (!err) {
                try {
                    content = JSON.parse(content);
                } catch (e) {}
                lastHistory = content || lastHistory;
            }
            resolve(lastHistory);
        })
    });
};

History.prototype.save = function (msg) {
    this.get().then(
        function (content) {
            msg.time = new Date();
            content.messages.push(msg);
            content = JSON.stringify(content);
            fs.writeFile('history.json', content);
        }
    );
};

module.exports = new History();