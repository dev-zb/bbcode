var gulp = require("gulp");
var babel = require("gulp-babel");
var options = require("./babel-options");
var del = require('del');
var runSequence = require('run-sequence');
var vinylPaths = require('vinyl-paths');
var concat = require('gulp-concat');

var paths = {
    src: 'src/',
    output: 'dist/'
};
var moduleTypes = ['es2015','commonjs','amd','system'];

var files = function(dir) { return [
    dir + 'helper.js',
    dir + 'parser.js',
    dir + 'tag_parser.js',
    dir + 'ping_parser.js',
    dir + 'def.js',
    dir + 'html.js'
] };
var configs = function(dir) { return [
    dir + 'config.js',
    dir + 'config.semantic.js',
    dir + 'config.html.js'
]; }

var all_files = files(paths.src).concat(configs(paths.src));

moduleTypes.forEach(function(moduleType){
    gulp.task('build-' + moduleType, function () {
        return gulp.src(all_files)
                   .pipe(babel(Object.assign({}, options[moduleType]())))
                   .pipe(gulp.dest(paths.output + moduleType));
    })
});

// ?
let bundle_tasks = [];
configs('').forEach( function(configType) {
    moduleTypes.forEach(function(moduleType) {
        var name = configType.slice(0,-3).replace('.','-');
        var task = 'bundle-' + moduleType + '-' + name;
        var path = paths.output + moduleType + '/';
        bundle_tasks.push(task); 
        gulp.task(task, function() {
            return gulp.src(files(path).concat([path + configType]))
                       .pipe(concat(name + '-' + 'index.js'))
                       .pipe(gulp.dest(path));
        });
    });
});


gulp.task('clean', function() {
    return gulp.src([paths.output])
               .pipe(vinylPaths(del));
});

gulp.task("build", function(callback) {
    return runSequence(
        'clean',
        moduleTypes.map(function(moduleType) { return 'build-' + moduleType }),
        bundle_tasks,
        callback
    );
});

