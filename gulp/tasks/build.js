var gulp = require('gulp');
var runSequence = require('run-sequence');

module.exports = function(options) {
    gulp.task('build', function(callback) {
        runSequence('clean',
            'bower',
            ['eslint', 'jscs', 'jshint'],
            ['styles', 'templates'],
            'browserify',
            'i18next',
            callback
        );
    });
    gulp.task('styles', ['stylus', 'csslint']);
    gulp.task('templates', ['handlebars']);
};
