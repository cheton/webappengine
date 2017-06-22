/* eslint import/no-dynamic-require: 0 */
import path from 'path';
import express from 'express';
import engines from 'consolidate';
import errorhandler from 'errorhandler';
import multihost from 'multihost';
import serveStatic from 'serve-static';
import log from './lib/log';
import settings from './config/settings';
import errclient from './lib/middleware/errclient';
import errlog from './lib/middleware/errlog';
import errnotfound from './lib/middleware/errnotfound';
import errserver from './lib/middleware/errserver';

const appMain = () => {
    // Main app
    const app = express();

    {  // Settings
        if (settings.env === 'development') {
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

        for (let i = 0; i < settings.view.engines.length; ++i) {
            const extension = settings.view.engines[i].extension;
            const template = settings.view.engines[i].template;
            app.engine(extension, engines[template]);
        }
        app.set('view engine', settings.view.defaultExtension); // The default engine extension to use when omitted
        app.set('views', path.join(__dirname, 'views')); // The view directory path

        log.debug('app.settings: %j', app.settings);
    }

    settings.routes.forEach((options) => {
        if (options.type === 'static') {
            // Serve static assets
            app.use(options.route, serveStatic(path.resolve(options.directory)));
            log.debug('Served a static directory:', JSON.stringify(options, null, 4));
            return;
        }

        try {
            let server = options.server;

            if (typeof server === 'string') {
                // Modules are cached after the first time they are loaded.
                // The cached module must be invalidated to ensure data-independences in a multi-host environment.
                const serverPath = path.resolve(options.server);
                if (require.cache[serverPath]) {
                    delete require.cache[serverPath];
                }

                server = require(serverPath);

                // Ready for ES6
                if (typeof server === 'object') {
                    server = server.default;
                }
            }

            if (typeof server !== 'function') {
                log.error('The multi-host server does not exist:', JSON.stringify(options, null, 4));
                return;
            }

            app.use(multihost({
                hosts: options.hosts,
                route: options.route,
                server: server({
                    route: options.route
                })
            }));
        } catch (e) {
            console.error(e.stack);
            log.error('The multi-host server does not exist:', JSON.stringify(options, null, 4));
            return;
        }

        log.debug('Attached a multi-host server:', JSON.stringify(options, null, 4));
    });

    { // Error handling
        app.use(errlog());
        app.use(errclient({
            error: 'XHR error'
        }));
        app.use(errnotfound({
            view: path.join('common', '404.hogan'),
            error: 'Not found'
        }));
        app.use(errserver({
            view: path.join('common', '500.hogan'),
            error: 'Internal server error'
        }));
    }

    return app;
};

export default appMain;
