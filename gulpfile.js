// Variables
var debug = false
var templates = 'templates/'

// Dirs
var config = require('./gulp-config.json');

// Gulp
var gulp = require('gulp')

var plugins = require("gulp-load-plugins")({
    pattern: ['gulp-*', 'gulp.*', 'main-bower-files', 'bower-main', 'del', 'merge2'],
    replaceString: /\bgulp[\-.]/
})

var bowerMainJavaScriptFiles = plugins.bowerMain('js','min.js')

// Bower
gulp.task('bower', function() {
    return gulp.src(plugins.mainBowerFiles())
        .pipe(plugins.debug({title: "Bower"}))

    //return plugins.bower()
})

// Clean
gulp.task('clean-all', ['clean-temp', 'clean-static', 'clean-inject'], function() {
})

gulp.task('clean-temp', function() {
    return plugins.del(config.paths.temp)
})

gulp.task('clean-static', function() {
    return gulp.src('./static')
        .pipe(plugins.clean({force: true}))
})

gulp.task('clean-inject', function() {
    return gulp.src('./templates/**/*.html')
        .pipe(plugins.replace(/<!-- (.*?):js -->([\S\s.]*)<!-- endinject -->/g, '<!-- $1:js -->\n  <!-- endinject -->'))
        .pipe(gulp.dest(templates))
})

// Scripts
gulp.task('build-js', ['clean-temp', 'build-app-js', 'build-vendor-js'], function() {
})

gulp.task('build-app-js', ['clean-temp'], function() {
    if(debug) {
        gulp.src('./src/js/**/*.js', { base: './src/js/' })
            .pipe(gulp.dest('./tmp/js/app'))
    }
    else {
        gulp.src('./src/js/**/*.js')
            .pipe(plugins.concat('app.min.js'))
            .pipe(plugins.uglify())
            .pipe(gulp.dest('./tmp/js'))
    }
})

gulp.task('build-vendor-js', ['clean-temp'], function() {
    if(debug) {
        return gulp.src(bowerMainJavaScriptFiles.normal)
            .pipe(gulp.dest(tmp + 'js/vendor'))
    }
    else {
        return plugins.merge2(
                gulp.src(bowerMainJavaScriptFiles.minified),
                gulp.src(bowerMainJavaScriptFiles.minifiedNotFound)
                    .pipe(plugins.concat('tmp.min.js'))
                    .pipe(plugins.uglify())
                )
            .pipe(plugins.concat('vendor.min.js'))
            .pipe(gulp.dest('./tmp/js'))
    }
})

gulp.task('copy:fonts', ['clean-temp'], function() {
    fontFiles = [config.paths.fonts.src]
    fontFiles = fontFiles.concat(plugins.mainBowerFiles('**/*.{eot,svg,ttf,woff}'))
    return gulp.src(fontFiles)
            .pipe(plugins.debug({title: "fonts"}))
            .pipe(plugins.flatten())
            .pipe(gulp.dest(config.paths.fonts.dest))
})

gulp.task('copy-static', ['build-js', 'copy-vendor-font'], function() {
    return gulp.src('./tmp/**/*.*', { base: './tmp' })
        .pipe(gulp.dest('./static'))
})

// Inject
gulp.task('inject', ['clean-inject', 'copy-static'], function() {
    jsFiles = ['./static/js/vendor/*.js', './static/js/app/*.js', './static/js/*.js']
    return gulp.src(templates + '**/*.html')
      .pipe(plugins.inject(gulp.src(jsFiles, {read: false}), {relative: false}))
      .pipe(gulp.dest(templates))
})

// Tasks
gulp.task('default', ['clean-all'], function () {
    gulp.start('build-js', 'inject')
})

gulp.task('debug', ['clean-all'], function () {
    debug = true
    gulp.start('build-js', 'inject')
})

gulp.task('watch', function () {

})