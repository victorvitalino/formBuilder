'use strict';

import gulp from 'gulp';
import gulpPlugins from 'gulp-load-plugins';
import bsync from 'browser-sync';
import pkg from './package.json';

var plugins = gulpPlugins();

const files = {
  test: [
    'test/**/*.spec.js'
  ],
  js: [
    'src/js/form-builder.js',
    'src/js/to-xml.js'
  ],
  sass: [
    'src/sass/form-builder.scss'
  ],
  demoSass: [
    'demo/assets/sass/demo.scss'
  ]
};

var banner = [
  '/*',
  '<%= pkg.name %> - <%= pkg.repository.url %>',
  'Version: <%= pkg.version %>',
  'Author: <%= pkg.authors[0] %>',
  '*/',
  ''
].join('\n');

gulp.task('watch', function() {
  gulp.watch(['src/**/*.js'], ['lint', 'js']);
  gulp.watch('demo/index.html', bsync.reload);
  files.sass.push('src/sass/*.scss');
  gulp.watch(files.sass, ['css']);
});

gulp.task('css', function() {
  return gulp.src(files.sass)
    .pipe(plugins.sass())
    .pipe(plugins.autoprefixer({
      cascade: true
    }))
    .pipe(plugins.base64())
    .pipe(plugins.cssmin())
    .pipe(plugins.header(banner, {
      pkg: pkg,
      now: new Date()
    }))
    .pipe(gulp.dest('demo/assets'))
    .pipe(gulp.dest('dist/'))
    .pipe(bsync.reload({
      stream: true
    }));
});

gulp.task('font', function() {
  return gulp.src(['src/fonts/fontello/css/fontello.css'])
    .pipe(plugins.base64())
    .pipe(plugins.concat('_font.scss'))
    .pipe(gulp.dest('src/sass/'));
});

gulp.task('demoCss', function() {
  return gulp.src(files.demoSass)
    .pipe(plugins.sass())
    .pipe(plugins.autoprefixer({
      cascade: true
    }))
    .pipe(plugins.cssmin())
    .pipe(plugins.header(banner, {
      pkg: pkg,
      now: new Date()
    }))
    .pipe(gulp.dest('demo/assets'))
    .pipe(bsync.reload({
      stream: true
    }));
});

gulp.task('lint', function() {
  return gulp.src(files.js)
    .pipe(plugins.jshint())
    .pipe(plugins.jshint.reporter('jshint-stylish'));
});

gulp.task('js', function() {
  let buildDate = new Date();
  return gulp.src(files.js)
    .pipe(plugins.babel())
    .pipe(plugins.concat('form-builder.js'))
    .pipe(plugins.header(banner, {
      pkg: pkg,
      now: buildDate
    }))
    .pipe(gulp.dest('demo/assets'))
    .pipe(gulp.dest('dist/'))
    .pipe(plugins.uglify())
    .pipe(plugins.header(banner, {
      pkg: pkg,
      now: buildDate
    }))
    .pipe(plugins.concat('form-builder.min.js'))
    .pipe(gulp.dest('demo/assets'))
    .pipe(gulp.dest('dist/'))
    .pipe(bsync.reload({
      stream: true
    }));
});

gulp.task('serve', function() {
  bsync.init({
    server: {
      baseDir: './demo'
    }
  });
});

var increment = (importance) => {
  return gulp.src(['./package.json', './bower.json'])
    .pipe(plugins.bump({
      type: importance
    }))
    .pipe(gulp.dest('./'))
    .pipe(plugins.git.commit('bumps package version'))
    .pipe(plugins.filter('package.json'))
    .pipe(plugins.tagVersion());
};

gulp.task('patch', function() {
  return increment('patch');
});
gulp.task('feature', function() {
  return increment('minor');
});
gulp.task('release', function() {
  return increment('major');
});

// Deploy the demo
gulp.task('deploy', function() {
  var gitArgs = {
    args: 'subtree push --prefix demo origin gh-pages'
  };

  plugins.git.exec(gitArgs, function(err) {
    if (err) {
      console.error('There was an error deploying the Demo to gh-pages\n', err);
      throw err;
    } else {
      console.log('Demo was successfully deployed!\n');
    }
  });
});

gulp.task('default', ['js', 'css', 'demoCss', 'watch', 'serve']);
