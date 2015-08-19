var _ = require('lodash');
var settings = require('./app/config/settings');

/**
 * Overrides default settings and loads app/main.js
 * @param {object} [options] The options object
 * @param {number} [options.port] The listen port (default: 8000)
 * @param {string} [options.host] The listen address/hostname (default: 0.0.0.0)
 * @param {number} [options.backlog] The listen backlog (default: 511)
 * @param {array} [options.routes] An array containing the route settings
 */
module.exports = function(options) {
    options = options || {};

    // Overrides defaults
    _.set(settings, 'port', options.port || settings.port);
    _.set(settings, 'host', options.host || settings.host);
    _.set(settings, 'backlog', options.backlog || settings.backlog);
    _.set(settings, 'multihost.routes', options.routes || settings.multihost.routes);

    require('./app/main');
};
