var gulp = require("gulp");
var browserify = require("browserify");
var source = require('vinyl-source-stream');
var tsify = require("tsify");
var uglify = require("gulp-uglify");
var sourcemaps = require("gulp-sourcemaps");
var buffer = require("vinyl-buffer");
var sass = require("gulp-sass");
var tsc = require('gulp-typescript');

var tsServerProject = tsc.createProject('config/tsserver.json');


gulp.task("styles", function () {
    var sassTask = sass({
	outputStyle: "compressed"
    }).on('error', sass.logError);
    return gulp.src('src/css/*.scss')
	.pipe(sassTask)
	.pipe(gulp.dest('build/css'));
});

gulp.task("styles-dev", function () {
    var sassTask = sass({
	outputStyle: "nested",
	sourceComments: true
    }).on('error', sass.logError);
    return gulp.src('src/css/*.scss')
	.pipe(sourcemaps.init())
	.pipe(sassTask)
	.pipe(sourcemaps.write())
	.pipe(gulp.dest('build/css'));
});

gulp.task("js-dev", function () {
    return browserify({
        basedir: '.',
        debug: true,
	entries: ['src/js/controller.ts'],
	cache: {},
	packageCache: {}
    })
    .plugin(tsify, {project: "config/tsdev.json"})
    .bundle()
    .pipe(source('main.js'))
    .pipe(gulp.dest("build/js"));
});

gulp.task("js", function () {
    return browserify({
	    basedir: '.',
	    debug: false,
	    entries: ['src/js/controller.ts'],
            cache: {},
            packageCache: {}
    })
    .plugin(tsify, {project: "config/tsbuild.json"})
    .bundle()
    .pipe(source('main.min.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(uglify())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('build/js'));
});

gulp.task("server", function () {
    return tsServerProject.src()
    .pipe(tsServerProject())
    .pipe(gulp.dest('./'));
});

gulp.task("dev", ["styles-dev", "js-dev"]);
gulp.task("default", ["server", "styles", "js"]);
