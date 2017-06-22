/* eslint max-len: 0 */
/* eslint import/first: 0 */
/* eslint import/no-dynamic-require: 0 */

// Defaults to 'production'
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

import _ from 'lodash';
import path from 'path';
import program from 'commander';
import pkg from '../package.json';
import { createServer } from './app';

const increaseVerbosityLevel = (val, total) => {
    return total + 1;
};

program
    .version(pkg.version)
    .usage('[options]')
    .option('-p, --port <port>', 'set listen port (default: 8000)', 8000)
    .option('-H, --host <host>', 'set listen address or hostname (default: 0.0.0.0)', '0.0.0.0')
    .option('-b, --backlog <backlog>', 'set listen backlog (default: 511)', 511)
    .option('-c, --config <filename>', 'set multihost configuration file')
    .option('-v, --verbose', 'increase the verbosity level', increaseVerbosityLevel, 0)
    .parse(process.argv);

const main = (options = {}, callback) => {
    if (typeof options === 'function') {
        callback = options;
        options = {};
    }

    // Set multihost configuration settings
    let routes = [];
    if (program.config) {
        routes = require(path.resolve(program.config));
        if (!_.isArray(routes)) {
            callback(new Error('Check your multihost configuration file to ensure it contain valid routes.'));
            return;
        }
    }

    createServer({
        port: program.port,
        host: program.host,
        backlog: program.backlog,
        routes: routes,
        verbosity: program.verbose,
        ...options // Override command-line options if specified
    })
    .on('ready', (server) => {
        callback(null, server);
    })
    .on('error', (err) => {
        callback(err);
    });
};

export default main;
