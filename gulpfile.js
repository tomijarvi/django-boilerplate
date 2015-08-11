// Variables
var debug = false
var stat = 'static/'
var tmp = 'tmp/'
var src = 'src/'
var templates = 'templates/'

// Gulp
var gulp = require('gulp')

var plugins = require("gulp-load-plugins")({
    pattern: ['gulp-*', 'gulp.*', 'bower-main', 'merge2'],
    replaceString: /\bgulp[\-.]/
})

var bowerMainJavaScriptFiles = plugins.bowerMain('js','min.js')

// Bower
gulp.task('bower', function() {
    return plugins.bower()
})

// Clean
gulp.task('clean-all', ['clean-temp', 'clean-static', 'clean-inject'], function() {
})

gulp.task('clean-temp', function() {
    return gulp.src([tmp])
        .pipe(plugins.clean())
})

gulp.task('clean-static', function() {
    return gulp.src([stat])
        .pipe(plugins.clean())
})

gulp.task('clean-inject', function() {
    return gulp.src(templates + '**/*.html')
        .pipe(plugins.replace(/<!-- (.*?):js -->([\S\s.]*)<!-- endinject -->/g, '<!-- $1:js -->\n  <!-- endinject -->'))
        .pipe(gulp.dest(templates))
})

// Scripts
gulp.task('build-js', ['clean-temp', 'build-src-js', 'build-vendor-js'], function() {

})

gulp.task('build-src-js', ['clean-temp'], function() {
    if(debug) {
        gulp.src(src + 'js/*.js', { base: src + 'js/' })
            .pipe(gulp.dest(tmp + 'js'))
    }
    else {
        gulp.src(src + '**/*.js')
            .pipe(plugins.concat('current.min.js'))
            .pipe(plugins.uglify())
            .pipe(gulp.dest(tmp + 'js'))
    }
})

gulp.task('build-vendor-js', ['clean-temp'], function() {
    if(debug) {
        return gulp.src(bowerMainJavaScriptFiles.normal)
            .pipe(gulp.dest(tmp + 'js'))
    }
    else {
        return plugins.merge2(
                gulp.src(bowerMainJavaScriptFiles.minified),
                gulp.src(bowerMainJavaScriptFiles.minifiedNotFound)
                    .pipe(plugins.concat('tmp.min.js'))
                    .pipe(plugins.uglify())
                )
            .pipe(plugins.concat('vendor.min.js'))
            .pipe(gulp.dest(tmp + 'js'))
    }
})

gulp.task('copy-static', ['build-js'], function() {
    return gulp.src(tmp + "**/*.*", { base: tmp })
        .pipe(gulp.dest(stat))
})

// Inject
gulp.task('inject', ['clean-inject', 'copy-static'], function() {
    return gulp.src(templates + '**/*.html')
      .pipe(plugins.inject(gulp.src(stat + '**/*.js', {read: false}), {relative: false}))
      .pipe(gulp.dest(templates))
})

// Tasks
gulp.task('default', ['clean-all'], function () {
    gulp.start('build-js', 'inject')
})

gulp.task('debug', ['clean-all'], function () {
    debug = true;
    gulp.start('build-js', 'inject')
})

gulp.task('watch', function () {

})