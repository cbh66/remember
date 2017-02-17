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
var fs = require('fs');

var tsServerProject = tsc.createProject('config/tsserver.json');

var mongoPath = "./mongo";

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

gulp.task("js-dev", function () {
    return browserify({
        basedir: '.',
        debug: true,
	entries: ['src/ts/controller.ts'],
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
            entries: ['src/ts/controller.ts'],
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
    .pipe(gulp.dest('./build/server'));
});


gulp.task("hydrate", function () {
    return gulp.src("./hydrate.ts")
    .pipe(tsc({
	noImplicitAny: true
     }))
    .pipe(gulp.dest("./"))
});

gulp.task("copyHtml", function () {
    return gulp.src("./src/**/*.html")
    .pipe(gulp.dest("./build"));
});

gulp.task("startdb", ["server", "hydrate"], function () {
    if (!fs.existsSync(mongoPath)) {
	fs.mkdirSync(mongoPath);
    }
    runAsync("mongod --dbpath " + mongoPath);
    setTimeout(function () {runAsync("node hydrate.js");}, 5000);
});


gulp.task("startserver", ["server"], function () {
    return nodemon({
        script: "build/server/app.js",
        watch: "build/server/app.js"
    }).on("restart", function () {
        console.log("Server restarting....");
    }).on("crash", function () {
        console.error("Server has crashed.")
    });
});

gulp.task("dev", ["styles-dev", "js-dev", "copyHtml"]);
gulp.task("default", ["server", "styles", "js", "copyHtml"]);
gulp.task("run", ["default", "startdb", "startserver"]);
gulp.task("watch", ["run"], function () {
    gulp.watch("./src/server/**/*.ts", ["server"]);
    gulp.watch("./src/ts/**/*.ts", ["js-dev"]);
    gulp.watch("./src/styles/**/*.scss", ["styles-dev"]);
    gulp.watch("./src/**/*.html", ["copyHtml"]);
    // startserver already watched for the server file
});