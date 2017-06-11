var gulp = require('gulp');
var util = require('gulp-util');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync').create();
var del = require('del');
var uglify   = require('gulp-uglify');
var imagemin = require('gulp-imagemin');
var concat = require('gulp-concat');

/******************************************************
 * CONFIGURATION
******************************************************/
var bsProxy       = "gulpck2017.localhost";

var themePath     = 'files/homePage/';

var paths = {
    src: {
        styles:     themePath + 'src/scss/combiner.scss',
        scripts:    themePath + 'src/js/**/*.js',
        images:     themePath + 'src/img/**/*',
        fonts:      themePath + 'src/fonts/**/*',
    },
    dist: {
        styles:     themePath + 'dist/css',
        scripts:    themePath + 'dist/js',
        images:     themePath + 'dist/img',
        fonts:      themePath + 'dist/fonts',
    },
    watch: {
        styles:     themePath + 'src/scss/**/*.scss',
        scripts:    themePath + 'src/js/**/*.js',
        images:     themePath + 'src/img/**/*',
        templates:  'templates/**/*'
    },
};


/******************************************************
 * CLEAN TASKS
******************************************************/
gulp.task('clean:styles', function() {
    return del([paths.dist.styles + '/**/*']);
});

gulp.task('clean:scripts', function() {
    return del([paths.dist.scripts + '/**/*']);
});

/******************************************************
 * SCSS RENDERING TASKS
******************************************************/
gulp.task('styles:dev', function() {
    return gulp.src(paths.src.styles)
      .pipe(sourcemaps.init())
      .pipe(sass({outputStyle: 'expand', errLogToConsole:true}))
              .on('error', function(err) {
                  console.log(err);
                  this.emit('end');
              })

      .pipe(autoprefixer({
          browsers: ['last 3 versions'],
          cascade: false
      }))
      .pipe(sourcemaps.write())
      .pipe(gulp.dest(paths.dist.styles))
      .pipe(browserSync.stream({match: '**/*.css'}));
});

gulp.task('styles:prod', function() {
    return gulp.src(paths.src.styles)
      .pipe(sass({outputStyle: 'compressed', errLogToConsole:false}))
              .on('error', function(err) {
                  console.log(err);
                  this.emit('end');
              })

      .pipe(autoprefixer({
          browsers: ['last 3 versions'],
          cascade: false
      }))
      .pipe(gulp.dest(paths.dist.styles))
});

/******************************************************
 * SERVER AND WATCHER TASKS
******************************************************/
gulp.task('browserSync', function() {
      browserSync.init({
          proxy: bsProxy,
          open: true
      });
});

gulp.task('watch:styles', function() {
    gulp.watch(paths.watch.styles, gulp.series ('styles:dev')).on('all', (event,path) => {
    console.log(event,path);
  });
});

gulp.task('watch:templates', function() {
    gulp.watch(paths.watch.templates).on('change', browserSync.reload);
});

gulp.task('watch:scripts', function() {
  gulp.watch(paths.watch.scripts, gulp.series ('scripts:dev')).on('change', browserSync.reload);
});

gulp.task('watch', gulp.parallel('watch:styles', 'watch:templates', 'watch:scripts'));

/******************************************************
 * JACASCRIPT TASKS
******************************************************/
gulp.task('scripts:dev', function() {
    gulp.src(paths.src.scripts)
        .pipe(sourcemaps.init())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(paths.dist.scripts))
});

// read, combine and uglyify js
gulp.task('scripts:prod', function() {
    return gulp.src(paths.src.scripts)
    	.pipe(concat('main.js'))
        .pipe(uglify())
        .pipe(gulp.dest(paths.dist.scripts))
});

/******************************************************
 * COPY STATIC ASSETS
******************************************************/
gulp.task('copy:images', function () {
    return gulp.src(paths.src.images)
        .pipe(imagemin({
          progressive: true,
        }))
        .pipe(gulp.dest(paths.dist.images));
});

gulp.task('copy:font', function() {
   gulp.src(paths.src.fonts)
   .pipe(gulp.dest(paths.dist.fonts));
});

// gulp.task('copy:assets', gulp.parallel(
//   'copy:images',
//   'copy:font',
// ));

/******************************************************
 * MAIN TASKS
******************************************************/
gulp.task('default', gulp.parallel('watch', 'browserSync')); //includes style rendering
gulp.task('deploy', gulp.series('clean:styles','clean:scripts', gulp.parallel('styles:prod', 'scripts:prod')));
