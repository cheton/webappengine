// Module dependencies
var fs = require('fs'),
    path = require('path'),
    connect = require('connect'),
    express = require('express'),
    engines = require('consolidate'),
    i18n = require('i18next'),
    urljoin = require('./lib/urljoin'),
    _ = require('lodash'),
    logger = require('./lib/logger'),
    settings = require('./config/settings');

// Auto-load bundled middleware
var middleware = {};

fs.readdirSync(__dirname + '/lib/middleware').forEach(function(filename) {
    if ( ! /\.js$/.test(filename)) {
        return;
    }
    var name = path.basename(filename, '.js');
    middleware[name] = require('./lib/middleware/' + name);
});

module.exports = function() {
    // Main app
    var app = express();
    var errorhandler = require('errorhandler');
    var serveStatic = require('serve-static');

    // Setup logger (winston)
    logger.init(settings.winston);
    logger.registerAppHelper(app); // Register app.locals (app.helper)

    var log = logger();

    // Settings
    (function(app) {
        var env = process.env.NODE_ENV || 'development';
        if ('development' === env) {
            // Error handler - https://github.com/expressjs/errorhandler
            // Development error handler, providing stack traces and error message responses
            // for requests accepting text, html, or json.
            app.use(errorhandler());

            // a custom "verbose errors" setting which can be used in the templates via settings['verbose errors']
            app.enable('verbose errors'); // Enables verbose errors in development
            app.disable('view cache'); // Disables view template compilation caching in development
        } else {
            // a custom "verbose errors" setting which can be used in the templates via settings['verbose errors']
            app.disable('verbose errors'); // Disables verbose errors in production
            app.enable('view cache'); // Enables view template compilation caching in production
        }

        app.enable('trust proxy'); // Enables reverse proxy support, disabled by default
        app.enable('case sensitive routing'); // Enable case sensitivity, disabled by default, treating "/Foo" and "/foo" as the same
        app.disable('strict routing'); // Enable strict routing, by default "/foo" and "/foo/" are treated the same by the router
        app.disable('x-powered-by'); // Enables the X-Powered-By: Express HTTP header, enabled by default

        for (var i = 0; i < settings.view.engines.length; ++i) {
            var extension = settings.view.engines[i].extension;
            var template = settings.view.engines[i].template;
            app.engine(extension, engines[template]);
        }
        app.set('view engine', settings.view.defaultExtension); // The default engine extension to use when omitted
        app.set('views', path.join(__dirname, 'views')); // The view directory path

        log.info('app.settings: %j', app.settings);
    }(app));

    // Multi-host
    console.assert( ! _.isUndefined(middleware.multihost), 'lib/middleware/multihost not found');

    (function(app) {
        _.each(settings.multihost.routes, function(options) {
            if (options.type === 'static') {
                // Serve static assets
                app.use(options.route, serveStatic(path.resolve(options.directory)));
                log.info('Served a static directory:', JSON.stringify(options, null, 4));
                return;
            }

            // Modules are cached after the first time they are loaded.
            // The cached module must be invalidated to ensure data-independences in a multi-host environment.
            var server_path = path.resolve(options.server);
            if (require.cache[server_path]) {
                delete require.cache[server_path];
            }

            if ( ! fs.statSync(server_path) &&
                 ! fs.statSync(server_path + '.js') &&
                 ! fs.statSync(path.join(server_path, 'index.js'))) {
                log.error('The multi-host server does not exist:', JSON.stringify(options, null, 4));
                return;
            }

            var server = require(server_path);
            app.use(middleware.multihost({
                hosts: options.hosts,
                route: options.route,
                server: server({
                    route: options.route
                })
            }));

            log.info('Attached a multi-host server:', JSON.stringify(options, null, 4));
        });
    }(app));

    // Error handling
    console.assert( ! _.isUndefined(middleware.err_log), 'lib/middleware/err_log not found');
    console.assert( ! _.isUndefined(middleware.err_client), 'lib/middleware/err_client not found');
    console.assert( ! _.isUndefined(middleware.err_notfound), 'lib/middleware/err_notfound not found');
    console.assert( ! _.isUndefined(middleware.err_server), 'lib/middleware/err_server not found');

    app.use(middleware.err_log());
    app.use(middleware.err_client({
        error: 'XHR error'
    }));
    app.use(middleware.err_notfound({
        view: path.join('common', '404.hogan'),
        error: 'Not found'
    }));
    app.use(middleware.err_server({
        view: path.join('common', '500.jade'),
        error: 'Internal server error'
    }));

    return app;
};
