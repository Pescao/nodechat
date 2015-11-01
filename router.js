var child_process = require("child_process");

var Router = function (router, MsgHistory, io) {
	var pathRegExp = /([\/a-z0-9-_]+)(\.(?:js|css|mp3|html|json|txt))?/i;

	router.use(function (req, res, next) {
	    var url = pathRegExp.exec(req.url);
	    if (!url) return;

	    var path = url[1],
	        ext = url[2];

	    if (path && ext) {
	        res.sendFile(__dirname + path + ext);
	    } else if (path == '/') {
	        res.sendFile(__dirname + '/index.html');
	    } else if (path) {
	        next();
	    }
	});

	router.get('/getHistory', function (req, res) {
	    MsgHistory.get().then(function (content) {
	        res.send(JSON.stringify(content));
	    });
	});
	router.get('/updateFromRepo', function (req, res) {
		var command = 'git pull';
	    child_process.exec(command, function (error, stdout, stderr) {
		    io.emit('code updated');
		    res.send(JSON.stringify({
		    	command: command,
		    	stdout: stdout,
		    	stderr: stderr
		    }));
	    });
	});

	return router;
};

(function () {
    var oldSpawn = child_process.spawn;
    child_process.spawn = function mySpawn() {
        //console.log('spawn called');
        //console.log(arguments);
        return oldSpawn.apply(this, arguments);
    };
})();

module.exports = Router;