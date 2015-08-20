var settings = require('./config/settings');

module.exports = function() {
    var app;

    if (settings.multihost.enable) {
        app = require('./app.multihost')();
    } else {
        app = require('./app.standalone')();
    }

    return app;
};
