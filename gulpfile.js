var gulp = require("gulp");
var browserify = require("browserify");
var source = require('vinyl-source-stream');
var tsify = require("tsify");
var uglify = require("gulp-uglify");
var sourcemaps = require("gulp-sourcemaps");
var buffer = require("vinyl-buffer");
var sass = require("gulp-sass");


gulp.task("styles", function () {
    return gulp.src('src/css/*.scss')
	.pipe(sass({outputStyle: "compressed"}).on('error', sass.logError))
	.pipe(gulp.dest('build/css'));
});

gulp.task("styles-dev", function () {
    return gulp.src('src/css/*.scss')
	.pipe(sourcemaps.init())
	.pipe(sass({outputStyle: "nested"}).on('error', sass.logError))
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
    .plugin(tsify)
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
    .plugin(tsify)
    .bundle()
    .pipe(source('main.min.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(uglify())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('build/js'));
});

gulp.task("dev", ["styles-dev", "js-dev"]);
gulp.task("default", ["styles", "js"]);
