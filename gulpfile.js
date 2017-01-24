var gulp = require("gulp");
var nodemon = require("gulp-nodemon");
var childProcess = require("child_process");
var browserify = require("browserify");
var source = require('vinyl-source-stream');
var tsify = require("tsify");
var uglify = require("gulp-uglify");
var sourcemaps = require("gulp-sourcemaps");
var buffer = require("vinyl-buffer");
var sass = require("gulp-sass");
var tsc = require('gulp-typescript');
var typedoc = require('gulp-typedoc');

var tsServerProject = tsc.createProject('config/tsserver.json');

function handleOutput(err, stdout, stderr) {
    if (err) {
        throw err;
    }
    console.log(stdout);
    console.error(stderr);
}

function runAsync(command) {
    var p = childProcess.exec(command, handleOutput);
    p.stdout.on("data", function (data) {
        console.log(data);
    });
    return p;
}

gulp.task("docs", function () {
    return gulp
        .src(["src/**/*.ts", "!src/**/*.spec.ts"])
        .pipe(typedoc({
	    module: "commonjs",
	    target: "es3",
	    out: "docs/",
	    name: "Together We Remember"
        }));
});

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

gulp.task("startdb", ["server"], function () {
    runAsync("mongod --dbpath ./mongo");
    setTimeout(function () {runAsync("node hydrate.js");}, 5000);
});


gulp.task("startserver", ["server"], function () {
    return nodemon({
        script: "server.js",
	watch: "server.js"
    }).on("restart", function () {
        console.log("Server restarting....");
    }).on("crash", function () {
        console.error("Server has crashed.")
    });
});

gulp.task("dev", ["styles-dev", "js-dev"]);
gulp.task("default", ["server", "styles", "js"]);
gulp.task("run", ["default", "startdb", "startserver"]);