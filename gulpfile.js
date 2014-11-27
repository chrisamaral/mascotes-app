var gulp = require('gulp'),
  gutil = require('gulp-util'),
  browserify = require('browserify'),
  webserver = require('gulp-webserver'),
  reactify = require('reactify'),
  source = require('vinyl-source-stream'),
  uglify = require('gulp-uglify'),
  concat = require('gulp-concat'),
  minifyCSS = require('gulp-minify-css'),
  sass = require('gulp-sass'),
  autoprefixer = require('gulp-autoprefixer'),
  gulpsync = require('gulp-sync')(gulp);

gulp.task('server', function () {
  gulp.src('./public')
    .pipe(webserver({
      port: 1999,
      host: '0.0.0.0',
      livereload: true
    }));
});

gulp.task('scripts', function () {
  return browserify({
    insertGlobals: true,
    entries: ['./src/js/app/app.jsx'],
    transform: ['reactify'],
    extensions: ['.js', '.jsx']
  })
    .bundle().on('error', gutil.log)
    .pipe(source('app.js'))
    .pipe(gulp.dest('./public/js'));
});

gulp.task('sass', function () {
  return gulp.src('./src/sass/app/app.scss')
    .on('error', gutil.log)
    .pipe(sass())
    .pipe(autoprefixer({
      browsers: require('../r2016.browsers.js'),
      cascade: false
    }))
    .pipe(gulp.dest('./public/css'));
});

gulp.task('watch', function() {
  gulp.watch(['./src/js/**/*.js', './src/js/**/*.jsx'], ['scripts']);
  gulp.watch(['./src/sass/**/*.scss'], ['sass']);
});

gulp.task('compress', function() {

  gulp.src('./public/js/app.js')
    .pipe(uglify())
    .pipe(gulp.dest('./public/js/'));

  gulp.src('./public/js/loader.js')
    .pipe(uglify())
    .pipe(gulp.dest('./public/js/'));

  gulp.src(['./public/css/app.css'])
    .pipe(concat('public.css'))
    .pipe(minifyCSS())
    .pipe(gulp.dest('./public/css/'));
});

gulp.task('generate',
  gulpsync.sync(['scripts', 'sass'], 'compile assets')
);

gulp.task('build',
  gulpsync.sync(['scripts', 'sass', 'compress'], 'build assets')
);

gulp.task('default',
  gulpsync.sync(['server', 'scripts', 'sass', 'watch'], 'normal workflow')
);