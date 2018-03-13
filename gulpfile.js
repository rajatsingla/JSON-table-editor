var gulp = require('gulp')
var concat = require('gulp-concat')
var rename = require('gulp-rename')
var uglify = require('gulp-uglify')
var cleanCSS = require('gulp-clean-css')
var order = require('gulp-order')
var clean = require('gulp-clean')
var shell = require('shelljs')

var jsFiles = 'src/js/*.js'
var cssFiles = 'src/css/*.css'
var Dest = 'dist'
var name = 'json-table-editor'

var cleanDest = function () {
  shell.rm('-rf', Dest)
}

var concateJS = function () {
  return gulp.src(jsFiles)
    .pipe(order([
      'start.js',
      'constants.js',
      'grid.js',
      'keyboard_shortcuts.js',
      'table_view.js',
      'table_model.js',
      'table_controller.js',
      'table_handler.js',
      'utils.js',
      'end.js'
    ]))
    .pipe(concat(name + '.js'))
    .pipe(gulp.dest(Dest))
    .pipe(rename(name + '.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(Dest))
}

var concateCSS = function () {
  return gulp.src(cssFiles)
    .pipe(concat(name + '.css'))
    .pipe(gulp.dest(Dest))
    .pipe(rename(name + '.min.css'))
    .pipe(cleanCSS())
    .pipe(gulp.dest(Dest))
}

gulp.task('build', function () {
  cleanDest()
  concateJS()
  concateCSS()
})
