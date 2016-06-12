/* eslint no-var: 0 */
/* eslint import/no-unresolved: 0 */
/**
 * @param {object} [options] The options object
 * @param {number} [options.port] The listen port (default: 8000)
 * @param {string} [options.host] The listen address or hostname (default: 0.0.0.0)
 * @param {number} [options.backlog] The listen backlog (default: 511)
 * @param {array} [options.routes] An array containing the route settings
 * @param {number} [options.verbose] The verbosity level (default: 0)
 */
module.exports = function(options) {
    var createServer = require('./dist/app').createServer;
    return createServer(options);
};
