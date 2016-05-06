import gulp from 'gulp';
import gutil from 'gulp-util';
import webpack from 'webpack';

const distConfig = {
    base: 'src/web',
    src: [
        'src/web/favicon.ico',
        'src/web/plugins.js',
        'src/web/{images,textures}/**/*',
        'src/web/vendor/**/*',
        'src/web/i18n/**/*'
    ],
    dest: 'dist/web'
};

export default (options) => {
    gulp.task('web:build-dev', (callback) => {
        if (process.env.NODE_ENV !== 'development') {
            const err = new Error('Set NODE_ENV to "development" for development build');
            throw new gutil.PluginError('web:build-dev', err);
        }

        const webpackConfig = require('../../webpack.config.development');
        webpack(webpackConfig, (err, stats) => {
            if (err) {
                throw new gutil.PluginError('web:build-dev', err);
            }
            gutil.log('[web:build-dev]', stats.toString({ colors: true }));
            callback();
        });
    });

    gulp.task('web:build-prod', (callback) => {
        if (process.env.NODE_ENV !== 'production') {
            const err = new Error('Set NODE_ENV to "production" for production build');
            throw new gutil.PluginError('web:build-prod', err);
        }

        const webpackConfig = require('../../webpack.config.production');
        webpack(webpackConfig, (err, stats) => {
            if (err) {
                throw new gutil.PluginError('web:build', err);
            }
            gutil.log('[web:build]', stats.toString({ colors: true }));
            callback();
        });
    });

    gulp.task('web:i18n', ['i18next:web']);

    gulp.task('web:dist', () => {
        return gulp.src(distConfig.src, { base: distConfig.base })
            .pipe(gulp.dest(distConfig.dest));
    });
};
