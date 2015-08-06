// Change the current working directory to ensure that files are relative to the current directory.
process.chdir(__dirname);

// Module dependencies
var cluster = require('cluster');
require('colors');
require('string-format');

var settings = require('./config/settings'); // the configuration settings have been initialized

var createMaster = function(cluster) {
    console.log('Starting directory:', process.cwd());
    console.log('NodeJS-%s-%s-%s', process.version, process.platform, process.arch);

    // Fork workers
    for (var i = 0; i < settings.cluster.maxWorkers; ++i) {
        cluster.fork();
    }

    // Event: online
    cluster.on('online', function(worker) {
        console.log('The worker #%d(pid=%d) is online', worker.id, worker.process.pid);
    });

    // Event: listening
    cluster.on('listening', function(worker, address) {
        console.log('The worker #%d(pid=%d) is listening on ' + '%s:%d'.bold.red, worker.id, worker.process.pid, address.address, address.port);
    });

    // Event: disconnect
    cluster.on('disconnect', function(worker) {
        console.log('The worker #%d(pid=%d) has disconnected', worker.id, worker.process.pid);
    });

    // Event: exit
    cluster.on('exit', function(worker, code, signal) {
        var exitCode = worker.process.exitCode;
        console.log('The worker #%d(pid=%d) died (%d). restarting...', worker.id, worker.process.pid, exitCode);
        cluster.fork();
    });
};

var createServer = function() {
    var app = require('./app')();
    var server = require('http').createServer(app);
    var io = require('./socket.io')(server);

    server.setMaxListeners(0); // Set to zero for unlimited
    io.setMaxListeners(0); // Set to zero for unlimited

    server.listen(settings.port, function() {
        // Lower the process privileges by setting the UID and GUID after the process has mound to the port.
        if (settings.uid) {
            process.setuid(settings.uid);
        }
        if (settings.gid) {
            process.setgid(settings.gid);
        }
        var address = server.address();
        console.log('Server is listening on %s:%d', address.address, address.port);
    });

    io.sockets.on('connection', function(socket) {
        socket.on('message', function(msg) {
            console.log('Received a message: %s', msg);
            socket.emit('message', { 'status': 'ok' });
        });
        socket.on('disconnect', function() {
            console.log('Disconnected');
        });
    });
};

if (settings.cluster.enable) {
    if (cluster.isMaster) { // True if the process is a master. 
        createMaster(cluster);

        // Event: message
        Object.keys(cluster.workers).forEach(function(id) {
            cluster.workers[id].on('message', function(msg) {
                if (msg.cmd === 'bonjour') {
                    console.log('Received a bonjour command from worker #%d(pid=%d)', this.id, this.process.pid);
                    this.send({reply: 'ok'});
                }
            });
        });

    } else if (cluster.isWorker) { // True if the process is not a master (it is the negation of cluster.isMaster).
        createServer();

        // Event: message
        process.send({cmd: 'bonjour'});
        process.on('message', function(msg) {
            console.log('Received a bonjour reply from master: %s', JSON.stringify(msg));
        });
    }
} else {
    // Debugging Clustered Apps with Node-Inspector
    // http://strongloop.com/strongblog/whats-new-nodejs-v0-12-debugging-clusters/
    createServer();
}
