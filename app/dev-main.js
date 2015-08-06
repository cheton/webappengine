var settings = require('./config/settings');
var _ = require('lodash');

var options = {
    port: 8000,
    route: '/', // with trailing slash
    backend: {
        host: 'example.com', // backend host
        port: 80, // backend port
        route: 'api/v1' // The backend route can either be absolute or relative value.
    },
    cdn: {
        uri: ''
    }
};

// Port
settings.port = options.port || process.env.PORT;

// Route
settings.route = options.route || '/';

// Backend
_.extend(settings.backend, options.backend);

// Content Delivery Network (CDN)
_.extend(settings.cdn, options.cdn);

require('./main');
