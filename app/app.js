var settings = require('./config/settings');

module.exports = function(options) {
    var app;

    if (settings.multihost.enable) {
        app = require('./app.multihost')(options);
    } else {
        app = require('./app.standalone')(options);
    }

    return app;
};
