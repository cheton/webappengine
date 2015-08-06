var gulp = require('gulp');
var plumber = require('gulp-plumber');
var stylus = require('gulp-stylus');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');

module.exports = function(options) {
    gulp.task('stylus', function() {
        var stylusConfig = options.config.stylus;
        var autoprefixerConfig = options.config.autoprefixer;

        return gulp.src(stylusConfig.src)
            .pipe(plumber({errorHandler: options.errorHandler.error}))
            .pipe(sourcemaps.init())
                .pipe(stylus(stylusConfig.options))
                .pipe(autoprefixer(autoprefixerConfig.options))
            .pipe(sourcemaps.write('/', {includeContent: false}))
            .pipe(gulp.dest(stylusConfig.dest));
    });
};
