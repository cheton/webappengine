var os = require('os');

var settings = {
    backend: {
        enable: true,
        host: 'localhost',
        port: 80,
        route: 'api/'
    },
    livereload: {
        enable: false
    },
    cluster: {
        // note. node-inspector cannot debug child (forked) process
        enable: false,
        maxWorkers: os.cpus().length || 1
    },
    //sessionSecret: 'SessionSecretForDevelopment',
    winston: {
        prefix: '',
        transports: {
            Console: {
                level: 'trace',
                silent: false,
                colorize: true,
                timestamp: true, // or function()
                json: false,
                handleExceptions: true
            }
        }
    }
};

module.exports = settings;
