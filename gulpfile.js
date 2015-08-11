// Variables
var debug = false
var dest = 'static/'
var tmp = 'tmp/'
var src = 'src/'
var debug = false;

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
gulp.task('clean-all', ['clean-static', 'clean-inject'], function() {
    return gulp.src([dest, tmp])
        .pipe(plugins.clean())
})

gulp.task('clean-static', function() {
    return gulp.src([dest, tmp])
        .pipe(plugins.clean())
})

gulp.task('clean-inject', function() {
    return gulp.src('./templates/**/*.html')
        .pipe(plugins.replace(/<!-- (.*?):js -->([\S\s.]*)<!-- endinject -->/g, '<!-- $1:js -->\n  <!-- endinject -->'))
        .pipe(gulp.dest('./templates'))
})

// Scripts
gulp.task('build-js', ['clean-static', 'build-vendor-js']), function() {

}

gulp.task('build-vendor-js', ['clean-static'], function() {
    if(debug) {
        return gulp.src(bowerMainJavaScriptFiles.normal)
            .pipe(gulp.dest(dest + 'js'))
    }
    else {
        return plugins.merge2(
                gulp.src(bowerMainJavaScriptFiles.minified),
                gulp.src(bowerMainJavaScriptFiles.minifiedNotFound)
                    .pipe(plugins.concat('tmp.min.js'))
                    .pipe(plugins.uglify())
                )
            .pipe(plugins.concat('vendor.min.js'))
            .pipe(gulp.dest(dest + 'js'))
    }
})

// Inject
gulp.task('inject', ['clean-inject', 'build-js'], function() {
    return gulp.src('./templates/**/*.html')
      .pipe(plugins.inject(gulp.src(dest + '/**/*.js', {read: false}), {relative: false}))
      .pipe(gulp.dest('./templates'))
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