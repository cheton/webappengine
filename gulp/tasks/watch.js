var gulp = require('gulp');

module.exports = function(options) {
    // Start browsersync task and then watch files for changes

    options.watch = true; // Set watch to true

    gulp.task('watch', ['browserify'], function() {
        gulp.watch(options.config.csslint.src, ['csslint']);
        gulp.watch(options.config.jshint.src, ['jshint']);
    });
};
