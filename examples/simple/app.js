var path = require('path'),
    express = require('express');

module.exports = function(options) {
    options = options || {};

    var app = express();
    var serveStatic = require('serve-static');
    var assetPath = path.resolve(__dirname, 'web');

    app.enable('case sensitive routing'); // Enable case sensitivity routing: "/Foo" is not equal to "/foo"
    app.disable('strict routing'); // Disable strict routing: "/foo" and "/foo/" are treated the same

    app.use(options.route, serveStatic(assetPath));

    return app;
};
