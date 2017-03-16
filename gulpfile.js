var gulp = require("gulp");
var nodemon = require("gulp-nodemon");
var childProcess = require("child_process");
var browserify = require("browserify");
var source = require('vinyl-source-stream');
var tsify = require("tsify");
var uglify = require("gulp-uglify");
var sourcemaps = require("gulp-sourcemaps");
var buffer = require("vinyl-buffer");
var es = require('event-stream');
var sass = require("gulp-sass");
var tsc = require('gulp-typescript');
var typedoc = require('gulp-typedoc');
var fs = require('fs');

var tsServerProject = tsc.createProject('config/tsserver.json');

var mongoPath = "./mongo";

function onCompilationError(error) {
    console.error(error.toString());
    this.emit('end');
}

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
	    target: "es6",
	    out: "docs/",
	    name: "Together We Remember"
        }))
	.on('error', onCompilationError);
});

gulp.task("styles", function () {
    var sassTask = sass({
	outputStyle: "compressed"
    }).on('error', sass.logError);
    return gulp.src('src/styles/*.scss')
	.pipe(sassTask)
	.pipe(gulp.dest('build/css'));
});

gulp.task("styles-dev", function () {
    var sassTask = sass({
	outputStyle: "nested",
	sourceComments: true
    }).on('error', sass.logError);
    return gulp.src('src/styles/*.scss')
	.pipe(sourcemaps.init())
	.pipe(sassTask)
	.pipe(sourcemaps.write())
	.pipe(gulp.dest('build/css'));
});

function bundleFile(src, dest) {
    return browserify({
        basedir: '.',
        debug: true,
	entries: [src],
	cache: {},
	packageCache: {}
    })
    .plugin(tsify, {project: "config/tsdev.json"})
    .bundle()
    .on('error', onCompilationError)
    .pipe(source(dest))
    .pipe(gulp.dest("build/js"));
}

gulp.task("bundle-dev", function () {
	var tasks = [{source: "src/ts/controller.ts", dest: "main.js"},
		     {source: "src/ts/read.ts", dest: "read.js"}];
	tasks = tasks.map(function (entry) {
		return bundleFile(entry.source, entry.dest);
	    });
	return es.merge(tasks);
});

gulp.task("bundle", function () {
    return browserify({
	    basedir: '.',
	    debug: false,
            entries: ['src/ts/controller.ts'],
            cache: {},
            packageCache: {}
    })
    .plugin(tsify, {project: "config/tsbuild.json"})
    .bundle()
    .on('error', onCompilationError)
    .pipe(source('main.min.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(uglify())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('build/js'));
});

gulp.task("ts", function () {
    return tsServerProject.src()
    .pipe(tsServerProject())
    .on('error', onCompilationError)
    .pipe(gulp.dest('./build/ts'));
});


gulp.task("hydrate", function () {
    return gulp.src("./hydrate.ts")
    .pipe(tsc({
	noImplicitAny: true
     }))
    .on('error', onCompilationError)
    .pipe(gulp.dest("./"))
});

gulp.task("copyStatic", function () {
    return gulp.src("./src/resources/**/*")
        .pipe(gulp.dest("./build/resources"));
});

gulp.task("startdb", ["hydrate"], function () {
    if (!fs.existsSync(mongoPath)) {
	fs.mkdirSync(mongoPath);
    }
    runAsync("mongod --dbpath " + mongoPath);
    setTimeout(function () {runAsync("node hydrate.js");}, 5000);
});

gulp.task("startserver", ["ts"], function () {
    return nodemon({
        script: "build/ts/server/app.js",
	watch: "build/ts/**/*"
    })
    .on("restart", function () {
        console.log("Server restarting....");
    }).on("crash", function () {
        console.error("Server has crashed.")
    });
});

gulp.task("dev", ["ts", "styles-dev", "bundle-dev", "copyStatic"]);
gulp.task("default", ["ts", "styles", "bundle", "copyStatic"]);
gulp.task("run", ["default", "startdb", "startserver"]);
gulp.task("run-dev", ["dev", "startdb", "startserver"]);
gulp.task("watch", ["run-dev"], function () {
    gulp.watch("./src/**/*.ts", ["ts", "bundle-dev"]);
    gulp.watch("./src/styles/**/*.scss", ["styles-dev"]);
    gulp.watch("./src/**/*.{html,json}", ["copyStatic"]);
    // startserver already watched for the server file
});