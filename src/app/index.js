/* eslint no-unused-vars: 0 */
import _ from 'lodash';
import settings from './config/settings';
import serverMain from './server';

const createServer = ({ port, host, backlog, routes = [], verbosity = 0 }) => {
    { // Override default settings
        if (port !== undefined) {
            _.set(settings, 'port', port);
        }
        if (host !== undefined) {
            _.set(settings, 'host', host);
        }
        if (backlog !== undefined) {
            _.set(settings, 'backlog', backlog);
        }
        if (routes.length > 0) {
            _.set(settings, 'routes', routes);
        }
        if (verbosity === 1) {
            _.set(settings, 'verbosity', verbosity);
            // https://github.com/winstonjs/winston#logging-levels
            _.set(settings, 'winston.level', 'verbose');
        }
        if (verbosity === 2) {
            _.set(settings, 'verbosity', verbosity);
            // https://github.com/winstonjs/winston#logging-levels
            _.set(settings, 'winston.level', 'debug');
        }
    }

    return serverMain();
};

export {
    createServer
};
