var gulp = require('gulp'),
    sass = require('gulp-sass'),
    browserSync = require('browser-sync'),
    concat = require('gulp-concat'),
    autoprefixer = require('gulp-autoprefixer'),
    rename = require('gulp-rename'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    plumber = require('gulp-plumber'),
    newer = require('gulp-newer'),
    del = require('del'),
    cleanCSS = require('gulp-clean-css'),
    uncss = require('gulp-uncss'),
    uglify = require('gulp-uglify'),
    useref = require('gulp-useref'),
    bourbon = require('node-bourbon'),
    fileinclude = require('gulp-file-include'),
    replace = require('gulp-replace');

gulp.task('browser-sync', function() {
  browserSync({
    server: {
      baseDir: 'src'
    },
    notify: false
  });
});

gulp.task('styles', function() {
  return gulp.src('src/sass/main.scss')
    .pipe(plumber())
    .pipe(sass({
      includePaths: bourbon.includePaths,
      outputStyle: 'expanded'
    }).on('error', sass.logError))
    //.pipe(uncss({ html: '*.html' }))
    .pipe(autoprefixer({ browsers: ['last 15 versions', '> 1%', 'ie 9'], cascade: true }))
    .pipe(gulp.dest('src/css'))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('scripts', function() {
  return gulp.src([
    'src/libs/jquery/dist/jquery.min.js'
    ])
    .pipe(plumber())
    .pipe(concat('libs.min.js'))
    //.pipe(uglify())
    .pipe(gulp.dest('src/js'));
});

// File include task

gulp.task('html', function() {
  gulp.src(['src/html/*.html'])
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(gulp.dest('src'))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('watch', ['html', 'styles', 'scripts', 'browser-sync'], function() {
  gulp.watch('src/sass/**/*.+(sass|scss)', ['styles']);
  gulp.watch('src/**/*.html', ['html'], browserSync.reload);
  gulp.watch('src/js/**/*.js', browserSync.reload);
});

gulp.task('clean', function() {
  return del.sync('build');
});

gulp.task('images', function() {
  return gulp.src('src/img/**/*')
    //.pipe(newer('build/img'))
    .pipe(plumber())
    .pipe(imagemin({
      interlaced: true,
      progressive: true,
      optimizationLevel: 5,
      svgoPlugins: [{removeViewBox: false}],
      use: [pngquant()]
    }))
    .pipe(gulp.dest('build/img'));
});

gulp.task('fonts', function() {
  return gulp.src('src/fonts/**/*')
    .pipe(gulp.dest('build/fonts/'));
});

gulp.task('assets', function() {
  return gulp.src('src/assets/**/*')
    .pipe(gulp.dest('build/assets/'));
});

gulp.task('build', ['clean', 'styles', 'scripts', 'images', 'fonts', 'assets'], function() {

  gulp.src([
    'src/css/main.css'
    ])
  //.pipe(uncss({ html: '*.html' }))
  // .pipe(replace('url("../fonts/', 'url("fonts/')) /* IF WORDPRESS */
  // .pipe(replace('url(../img/', 'url(img/')) /* IF WORDPRESS */
  .pipe(cleanCSS({compatibility: 'ie9'}))
  .pipe(rename({suffix: '.min'}))
  .pipe(gulp.dest('build/css'));

  gulp.src([
    'src/js/libs.min.js',
    'src/js/common.js'
    ])
  .pipe(concat('main.min.js'))
  .pipe(uglify())
  .pipe(gulp.dest('build/js'));

  gulp.src('src/*.html')
  .pipe(useref({noAssets:true}))
  .pipe(gulp.dest('build'));

});

gulp.task('default', ['watch']);
