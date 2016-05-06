import gulp from 'gulp';
import babel from 'gulp-babel';
import gutil from 'gulp-util';

export default (options) => {
    gulp.task('app:build-dev', (callback) => {
        if (process.env.NODE_ENV !== 'development') {
            const err = new Error('Set NODE_ENV to "development" for development build');
            throw new gutil.PluginError('app:build-dev', err);
        }

        const src = [
            'src/app/**/*.js'
            // exclusion
        ];
        return gulp.src(src)
            .pipe(babel())
            .pipe(gulp.dest('dist/app'));
    });

    gulp.task('app:build-prod', (callback) => {
        if (process.env.NODE_ENV !== 'production') {
            const err = new Error('Set NODE_ENV to "production" for production build');
            throw new gutil.PluginError('app:build-prod', err);
        }

        const src = [
            'src/app/**/*.js'
            // exclusion
        ];
        return gulp.src(src)
            .pipe(babel())
            .pipe(gulp.dest('dist/app'));
    });

    gulp.task('app:i18n', ['i18next:app']);

    gulp.task('app:dist', () => {
        const distConfig = {
            base: 'src/app',
            src: [
                'src/app/{i18n,views}/**/*'
            ],
            dest: 'dist/app'
        };

        return gulp.src(distConfig.src, { base: distConfig.base })
            .pipe(gulp.dest(distConfig.dest));
    });
};
