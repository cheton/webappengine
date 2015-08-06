var _ = require('lodash');
var gulp = require('gulp');
var gutil = require('gulp-util');
var path = require('path');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var streamify = require('gulp-streamify');
var uglify = require('gulp-uglify');
var notify = require('gulp-notify');
var gulpif = require('gulp-if');
var rename = require('gulp-rename');
var exorcist = require('exorcist');
var watchify = require('watchify');

module.exports = function(options) {
    gulp.task('browserify', ['browserify:vendor-bundler', 'browserify:app-bundler']);

    gulp.task('browserify:vendor-bundler', function() {
        var browserifyConfig = _.get(options.config, 'browserify.vendor') || {};
        var uglifyConfig = _.get(options.config, 'uglify') || {};
        var bundleFile = 'vendor.js';
        var bundleMapFile = path.join(browserifyConfig.dest, 'vendor.js.map');
        var minifiedBundleFile = 'vendor.min.js';

        // Create a separate vendor bundler that will only run when starting gulp
        var bundler = browserify(browserifyConfig.options);
        _.each(browserifyConfig.require, function(lib) {
            bundler.require(lib);
        });

        var start = new Date();
        return bundler.bundle()
            .on('error', options.errorHandler.error)
            .pipe(exorcist(bundleMapFile))
            .pipe(source(bundleFile))
            .pipe(gulpif(options.env !== 'development', streamify(uglify(uglifyConfig.options))))
            .pipe(gulp.dest(browserifyConfig.dest))
            .pipe(notify(function() {
                console.log('The ' + JSON.stringify(bundleFile) + ' bundle built in ' + (Date.now() - start) + 'ms');
            }));
    });

    gulp.task('browserify:app-bundler', function() {
        var browserifyConfig = _.get(options.config, 'browserify.app') || {};
        var uglifyConfig = _.get(options.config, 'uglify') || {};
        var browserifyTransform = browserifyConfig.transform;
        var bundleFile = 'app.js';
        var bundleMapFile = path.join(browserifyConfig.dest, 'app.js.map');
        var minifiedBundleFile = 'app.min.js';

        // Create the application bundler
        var bundler = browserify(browserifyConfig.options);
        bundler.add(browserifyConfig.src);
        bundler.transform('babelify');
        bundler.transform('reactify'); // Use reactify to transform JSX content
        bundler.transform('browserify-css', browserifyTransform['browserify-css']);
        bundler.transform('brfs');
        bundler.transform('browserify-shim', browserifyTransform['browserify-shim']);
        _.each(browserifyConfig.external, function(lib) {
            bundler.external(lib);
        });

        // The actual bundling process
        var rebundle = function() {
            var start = Date.now();
            bundler.bundle()
                .on('error', options.errorHandler.error)
                .pipe(exorcist(bundleMapFile))
                .pipe(source(bundleFile))
                .pipe(gulpif(options.env !== 'development', streamify(uglify(uglifyConfig.options))))
                .pipe(gulp.dest(browserifyConfig.dest))
                .pipe(notify(function() {
                    console.log('The ' + JSON.stringify(bundleFile) + ' bundle built in ' + (Date.now() - start) + 'ms');
                }));
        };

        // Add watchify
        if (options.watch) {
            bundler = watchify(bundler);
            bundler.on('update', rebundle);
        }

        // Trigger the initial bundling
        rebundle();

        return bundler;
    });
};
