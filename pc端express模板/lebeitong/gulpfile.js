// Load plugins
var gulp = require('gulp'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    //jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    livereload = require('gulp-livereload'),
    del = require('del');

// css
gulp.task('css', function() {
    return gulp.src('public/src/css/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({
            style: 'expanded'
        }))
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest('public/dist/css'))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(minifycss())
        .pipe(gulp.dest('public/dist/css'))
        .pipe(notify({
            message: 'css task complete'
        }));
});

// js
gulp.task('js', function() {
    return gulp.src('public/src/js/**/*.js')
        //.pipe(jshint('.jshintrc'))
        //.pipe(jshint.reporter('default'))
        .pipe(concat('main.js'))
        .pipe(gulp.dest('public/dist/js'))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(uglify())
        .pipe(gulp.dest('public/dist/js'))
        .pipe(notify({
            message: 'js task complete'
        }));
});

// img
gulp.task('img', function() {
    return gulp.src('public/src/img/**/*')
        .pipe(cache(imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest('public/dist/img'))
        .pipe(notify({
            message: 'img task complete'
        }));
});

// Clean
gulp.task('clean', function(cb) {
    del(['public/dist/css', 'public/dist/js', 'public/dist/img/**'], cb)
});

// Default task
gulp.task('default', ['clean'], function() {
    gulp.start('css', 'js', 'img');
});

// Watch
gulp.task('watch', function() {

    // Watch .scss files
    gulp.watch('public/src/css/**/*.scss', ['css']);

    // Watch .js files
    gulp.watch('public/src/js/**/*.js', ['js']);

    // Watch image files
    gulp.watch('public/src/img/**/*', ['img']);

    // Create LiveReload server
    livereload.listen();

    // Watch any files in public/dist/, reload on change
    gulp.watch(['public/dist/**', 'views/**/*.ejs']).on('change', livereload.changed);

});