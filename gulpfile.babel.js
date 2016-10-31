import gulp from 'gulp';
import babel from 'gulp-babel';
import eslint from 'gulp-eslint';
import del from 'del';

const paths = {
    src: './src/',
    src_files: './src/**/*.js',
    dist: './dist/',
};

const modules = 'es5,commonjs,amd'.split(',');


gulp.task( 'clean', () => {
    return del( paths.dist );
} );

gulp.task( 'lint', () => {
    return gulp.src( paths.src_files )
            .pipe( eslint() )
            .pipe( eslint.format() )
            .pipe( eslint.failAfterError() );
} );

gulp.task( 'build', ['lint', 'clean'], () => {
    return gulp.src( paths.src_files )
            .pipe( babel() )
            .pipe( gulp.dest( paths.dist ) );
} );


gulp.task( 'default', ['build'] );