var gulp = require('gulp')
var browserSync = require('browser-sync').create()
var rename = require('gulp-rename')
var sass = require('gulp-sass')
var autoPrefixer = require('gulp-autoprefixer')
require('es6-promise').polyfill()
var cssComb = require('gulp-csscomb')
var cmq = require('gulp-merge-media-queries')
var cleanCss = require('gulp-clean-css')
var uglify = require('gulp-uglify')
var concat = require('gulp-concat')
var clean = require('gulp-clean')
var babel = require('gulp-babel')

gulp.task('sass', done => {
  gulp.src(['src/css/main.scss'])
    .pipe(sass())
    .pipe(autoPrefixer())
    .pipe(cssComb())
    .pipe(cmq({log: true}))
    .pipe(concat('main.css'))
    .pipe(gulp.dest('dist/css'))
    .pipe(rename({
      suffix: '.min',
    }))
    .pipe(cleanCss())
    .pipe(gulp.dest('dist/css'))
    .pipe(browserSync.reload({stream: true}))
  done()
})

gulp.task('js', done => {
  gulp.src(['src/js/*.js'])
    .pipe(babel({
      presets: ['@babel/env'],
    }))
    .pipe(concat('main.js'))
    .pipe(gulp.dest('dist/js'))
    .pipe(rename({
      suffix: '.min',
    }))
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'))
    .pipe(browserSync.reload({stream: true}))
  done()
})

gulp.task('html', done => {
  gulp.src(['src/*.html'])
    .pipe(gulp.dest('dist'))
    .pipe(browserSync.reload({stream: true}))
  done()
})

gulp.task('clean', done => {
  return gulp.src('dist/*', {read: false})
    .pipe(clean())
})

gulp.task('copy-libs', done => {
  gulp.src(['node_modules/jquery/dist/jquery.min.js', 'node_modules/bootstrap/dist/js/bootstrap.bundle.min.js', 'node_modules/@babel/polyfill/dist/polyfill.min.js', 'node_modules/lodash/lodash.min.js '])
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest('dist/js'))

  gulp.src(['src/favicon.png'])
    .pipe(gulp.dest('dist'))

  gulp.src(['node_modules/@fortawesome/fontawesome-free/webfonts/*.*'])
    .pipe(gulp.dest('dist/webfonts'))

  gulp.src(['src/json/*.*'])
    .pipe(gulp.dest('dist/json'))

  gulp.src(['node_modules/bootstrap/dist/css/bootstrap.min.css', 'node_modules/@fortawesome/fontawesome-free/css/all.min.css'])
    .pipe(concat('vendor.min.css'))
    .pipe(cleanCss())
    .pipe(gulp.dest('dist/css'))

  done()
})

gulp.task('default', gulp.series('clean', 'copy-libs', 'html', 'sass', 'js', done => {
  browserSync.init({
    server: './dist',
  })
  gulp.watch('src/*.html', gulp.series('html'))
  gulp.watch('src/css/**/*.scss', gulp.series('sass'))
  gulp.watch('src/js/*.js', gulp.series('js'))
  done()
}))
