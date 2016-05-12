/* eslint no-console: 0 */
// Module dependencies
import cluster from 'cluster';
import events from 'events';
import http from 'http';
import settings from './config/settings';

const eventEmitter = new events.EventEmitter();

const createMaster = (cluster) => {
    console.log('Starting directory:', process.cwd());
    console.log('NodeJS-%s-%s-%s', process.version, process.platform, process.arch);

    // Fork workers
    for (let i = 0; i < settings.cluster.maxWorkers; ++i) {
        cluster.fork();
    }

    // Event: online
    cluster.on('online', (worker) => {
        console.log('The worker #%d(pid=%d) is online', worker.id, worker.process.pid);
    });

    // Event: listening
    cluster.on('listening', (worker, address) => {
        console.log('The worker #%d(pid=%d) is listening on %s:%d', worker.id, worker.process.pid, address.address, address.port);
    });

    // Event: disconnect
    cluster.on('disconnect', (worker) => {
        console.log('The worker #%d(pid=%d) has disconnected', worker.id, worker.process.pid);
    });

    // Event: exit
    cluster.on('exit', (worker, code, signal) => {
        const exitCode = worker.process.exitCode;
        console.log('The worker #%d(pid=%d) died (%d). restarting...', worker.id, worker.process.pid, exitCode);
        cluster.fork();
    });
};

const createServer = () => {
    const app = require('./app.multihost').default();
    const server = http.createServer(app);

    server.on('error', (err) => {
        eventEmitter.emit('error', err);
    });

    server.setMaxListeners(0); // Set to zero for unlimited

    server.listen(settings.port, settings.host, settings.backlog, () => {
        // Lower the process privileges by setting the UID and GUID after the process has mound to the port.
        if (settings.uid) {
            process.setuid(settings.uid);
        }
        if (settings.gid) {
            process.setgid(settings.gid);
        }

        eventEmitter.emit('ready', server);
    });

    return server;
};

const serverMain = () => {
    if (settings.cluster.enable) {
        if (cluster.isMaster) { // True if the process is a master.
            createMaster(cluster);

            // Event: message
            Object.keys(cluster.workers).forEach((id) => {
                cluster.workers[id].on('message', (msg) => {
                    if (msg.cmd === 'bonjour') {
                        console.log('Received a bonjour command from worker #%d(pid=%d)', this.id, this.process.pid);
                        this.send({ reply: 'ok' });
                    }
                });
            });
        } else if (cluster.isWorker) {
            // True if the process is not a master (it is the negation of cluster.isMaster).
            createServer();

            // Event: message
            process.send({ cmd: 'bonjour' });
            process.on('message', (msg) => {
                console.log('Received a bonjour reply from master: %s', JSON.stringify(msg));
            });
        }
    } else {
        // Debugging Clustered Apps with Node-Inspector
        // http://strongloop.com/strongblog/whats-new-nodejs-v0-12-debugging-clusters/
        createServer();
    }

    return eventEmitter;
};

export default serverMain;
