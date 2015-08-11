//------------------------------------------------------------------------------
// Copyright IBM Corp. 2015
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//------------------------------------------------------------------------------

var gulp = require('gulp');
var browserify = require('browserify');
var watchify = require('watchify');
var source = require('vinyl-source-stream');
var babelify = require('babelify');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var envify = require('envify/custom');
var less = require('gulp-less');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var csswring = require('csswring');

var path = {
  OUT: 'bundle.js',
  DEST: './public',
  ENTRY_POINT: './client/main.js'
}

/**
 * To build, create bundle.js and style.css
 */
gulp.task('build', ['browserify', 'less']);

/**
 * Create and minify bundle.js
 */
gulp.task('browserify', function () {
  process.env['NODE_ENV'] = 'production';
  return browserify(path.ENTRY_POINT)
    .transform(babelify.configure())
    .transform(envify({ NODE_ENV: 'production' }))
    .bundle()
    .pipe(source(path.OUT))  // gives streaming vinyl file object
    .pipe(buffer())          // convert from streaming to buffered vinyl file object
    .pipe(uglify())          // minify dat code
    .pipe(gulp.dest(path.DEST));
});

/**
 * Convert all less into minified autoprefixed css
 */
gulp.task('less', function () {
  return gulp.src('./client/**/*.less')
    .pipe(less())
    .pipe(postcss([
      autoprefixer(),
      csswring.postcss
    ]))
    .pipe(gulp.dest(path.DEST));
});

/**
 * In dev mode, watch for changes in client code and Less and
 * rebuild bundle.js or style.css when these happen
 */
gulp.task('dev', function () {
  gulp.watch(['./client/**/**.less'], ['less']);

  var watcher  = watchify(browserify({
    entries: [path.ENTRY_POINT],
    transform: [babelify],
    debug: true,
    cache: {},
    packageCache: {},
    fullPaths: true
  }));

  return watcher.on('update', function () {
    watcher.bundle()
      .pipe(source(path.OUT))
      .pipe(gulp.dest(path.DEST))
  }).bundle()
    .pipe(source(path.OUT))
    .pipe(gulp.dest(path.DEST));
});
