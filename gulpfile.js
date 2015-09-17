var $, gulp, handleError, serverPort = 8888;
var stylish = require('jshint-stylish');
var config = {
  cdn: 'http://7xk6xr.com1.z0.glb.clouddn.com',
  testcdn: 'http://7xkaf1.com1.z0.glb.clouddn.com',
  randomCdnPath: ''
};

gulp = require('gulp');

$ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'del', 'merge-stream', 'run-sequence','main-bower-files']
});

handleError = $.notify.onError({
  title: 'Gulp Error: <%= error.plugin %>',
  message: '<%= error.name %>: <%= error.toString() %>'
});

gulp.task('clean', function() {
  $.del(['.tmp', 'dist']);
});

gulp.task('clean:dev', function() {
  $.del(['.tmp']);
});

gulp.task('copy:index', function() {
  return gulp.src('app/index.tmpl.html')
  .pipe($.rename('index.html'))
  .pipe(gulp.dest('app/'));
});

gulp.task("sass", function(done) {
  gulp.src("./app/styles/main.scss")
  .pipe($.sass()).on('error', handleError)
  .pipe($.autoprefixer({
    browsers: ['last 2 versions'],
    cascade: false
  }))
  .pipe(gulp.dest(".tmp/styles/"))
  .on("end", done);
});

gulp.task('injector:js', function() {
  var sources, target;
  target = gulp.src('app/index.html');
  sources = gulp.src(['app/scripts/**/*.js','!app/scripts/vendor/**/*.js']).pipe($.angularFilesort());
  target.pipe($.inject(sources, {
    transform: function(filePath) {
      filePath = filePath.replace('/app/', '');
      return '<script src="' + filePath + '"></script>';
    },
    starttag: '<!-- injector:js -->',
    endtag: '<!-- endinjector -->'
  }))
  .pipe(gulp.dest('app/'));
});

gulp.task('injector:scss', function() {
  var sources, target;
  target = gulp.src('app/styles/main.scss');
  sources = gulp.src(['app/styles/**/*.scss','!app/styles/main.scss','!app/styles/_var.scss','!app/styles/_utils.scss','!app/styles/_mixin.scss']);
  target.pipe($.inject(sources, {
    transform: function(filePath) {
      filePath = filePath.replace('/app/styles/', '');
      return '@import "' + filePath + '";';
    },
    starttag: '// injector:scss',
    endtag: '// endinjector'
  }))
  .pipe(gulp.dest('app/styles/'));
});

gulp.task('bower', function() {
  var cssSources, jsSources, target;
  target = gulp.src('app/index.html');
  jsSources = gulp.src($.mainBowerFiles({
    filter: /.js$/
  }), {
    base: 'bower_components',
    read: false
  });
  cssSources = gulp.src($.mainBowerFiles({
    filter: /.css$/
  }), {
    base: 'bower_components',
    read: false
  });
  return target.pipe($.inject(jsSources, {
    transform: function(filePath) {
      filePath = filePath.replace('/app/', '');
      return '<script src="' + filePath + '"></script>';
    },
    starttag: '<!-- bower:js -->',
    endtag: '<!-- endbower -->'
  })).pipe($.inject(cssSources, {
    transform: function(filePath) {
      filePath = filePath.replace('/app/', '');
      return '<link rel="stylesheet" href="' + filePath + '">';
    },
    starttag: '<!-- bower:css -->',
    endtag: '<!-- endbower -->'
  })).pipe(gulp.dest('app/'));
});

gulp.task('copy:dev', function (argument) {
  return gulp.src('bower_components/bootstrap-sass/assets/fonts/**/*')
  .pipe(gulp.dest('.tmp/fonts/'));
});

gulp.task('connect', function() {
  $.connect.server({
    port: serverPort,
    livereload: true,
    middleware: function (connect) {
      return [
        // modRewrite(['\\student']),
        connect.static('.tmp'),
        connect().use(
          '/bower_components',
          connect.static('./bower_components')
        ),
        connect().use(
          '/app/styles',
          connect.static('./app/styles')
        ),
        connect.static('app')
      ];
    }
  });
  gulp.src("app/index.html")
  .pipe($.wait(1000))
  .pipe($.open('', {url:'http://localhost:' + serverPort}));
});

gulp.task('watch', function() {
  var watchPaths;
  $.livereload.listen();
  $.wait(1000);
  gulp.watch('bower.json', ['bower']);
  gulp.watch(['app/styles/**/*']).on('change', function(file) {
    return gulp.src(file.path)
      .pipe($.scssLint({
        'config': 'scssLint.yml'
      }));
  });
  gulp.watch(['app/styles/**/*'],['sass']);
  gulp.watch(['app/index.tmpl.html'], ['copy:index','injector:js','bower']);
  gulp.watch(['app/**/*.js']).on('change', function(file) {
    return gulp.src(file.path)
      .pipe($.jshint())
      .pipe($.jshint.reporter('jshint-stylish'))
      .pipe($.wait(1000)).pipe($.livereload());
  });
  gulp.watch(['.tmp/**/*.css']).on('change', function(file) {
    return gulp.src(file.path).pipe($.wait(1000)).pipe($.livereload());
  });
  gulp.watch(['app/**/*.html', '!app/index.tmpl.html', 'app/images/**/*.{png,jpg,jpeg,gif,webp,svg}']).on('change', $.livereload.changed);
});

gulp.task('imagemin', function() {
  return gulp.src(['app/images/{,*/}*.{png,jpg,jpeg,gif}']).pipe($.imagemin()).pipe(gulp.dest('dist/images/'));
});

gulp.task('svgmin', function() {
  return gulp.src(['app/images/{,*/}*.svg']).pipe($.svgmin()).pipe(gulp.dest('dist/images/'));
});

gulp.task('imgmin', ['imagemin', 'svgmin'])

gulp.task('ngtemplates', function() {
  return gulp.src(["app/views/**/*.html"]).pipe($.angularTemplatecache({
    module: 'appApp',
    root:'views/'
  })).pipe(gulp.dest('.tmp/'));
});

gulp.task('processhtml', function() {
  return gulp.src('app/index.html')
    .pipe($.processhtml())
    .pipe(gulp.dest('dist/'));
});

gulp.task('concat:template', function() {
  var sources;
  sources = gulp.src(['dist/scripts/app.js', '.tmp/templates.js']);
  return sources.pipe($.concat('app.js')).pipe(gulp.dest('dist/scripts/'));
});

gulp.task('usemin', function() {
  return gulp.src('app/index.html')
    .pipe($.usemin({outputRelativePath: ''}))
    .pipe(gulp.dest('dist/'));
});

gulp.task('ngmin', function() {
  return gulp.src('dist/**/*.js').pipe($.ngAnnotate()).pipe(gulp.dest('dist/'));
});

gulp.task('copy:dist', function() {
  return $.mergeStream([
    gulp.src(['app/*.{ico,png,txt}', 'app/.htaccess', 'app/images/**/*', 'app/fonts/**/*'], {
      base: 'app'
    }).pipe(gulp.dest('dist')),
    gulp.src(['bower_components/bootstrap-sass/assets/fonts/**/*']).pipe(gulp.dest('dist/fonts/')),
    gulp.src(['bower_components/font-awesome/fonts/**/*']).pipe(gulp.dest('dist/fonts/')),
    gulp.src(['package.json']).pipe(gulp.dest('dist'))
  ]);
});

gulp.task('cssmin', function() {
  return gulp.src('dist/**/*.css').pipe($.cssmin()).pipe(gulp.dest('dist/'));
});

gulp.task("revision", function(){
  return gulp.src(["dist/**/*.css", "dist/**/*.js"])
    .pipe($.rev())
    .pipe(gulp.dest('dist'))
    .pipe($.rev.manifest())
    .pipe(gulp.dest('dist'))
})

gulp.task("revreplace", function(){
  var manifest = gulp.src("./" + 'dist' + "/rev-manifest.json");

  return gulp.src("dist/index.html")
    .pipe($.revReplace({manifest: manifest}))
    .pipe(gulp.dest('dist'));
});


gulp.task('cdnify', function() {
  return gulp.src(['dist' + '/**/*.html', 'dist' + '/**/app*.js']).pipe($.cdnify({
    base: config.cdn + config.randomCdnPath,
    rewriter: function(url, process) {
      var result;
      if (url.indexOf('<%') === 0) {
        return url;
      } else {
        result = process(url);
        $.util.log('raw: ', url,'; result: ', result);
        return result;
      }
    }
  })).pipe(gulp.dest('dist'));
});

gulp.task('cdnify:test', function() {
  return gulp.src(['dist' + '/**/*.html', 'dist' + '/**/app*.js']).pipe($.cdnify({
    base: config.testcdn + config.randomCdnPath,
    rewriter: function(url, process) {
      var result;
      if (url.indexOf('<%') === 0) {
        return url;
      } else {
        result = process(url);
        $.util.log('raw: ', url,'; result: ', result);
        return result;
      }
    }
  })).pipe(gulp.dest('dist'));
});

gulp.task('uglify', function() {
  return gulp.src("dist/**/*.js").pipe($.uglify()).pipe($.size({
    showFiles: true
  })).pipe(gulp.dest("dist/"));
});

gulp.task('jshint', function() {
  return gulp.src(['app/scripts/**/*.js','!app/scripts/vendor/**/*.js'])
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.jshint.reporter('fail'));
});

gulp.task('dev', function() {
  $.runSequence(
    'clean:dev',
    'copy:index',
    'copy:dev',
    'injector:js',
    'injector:scss',
    'sass',
    'bower',
    'connect',
    'watch'
  );
});

gulp.task('build', function(){
  $.runSequence(
    'clean',
    'copy:index',
    'injector:js',
    'injector:scss',
    'sass',
    'bower',
    'imgmin',
    'ngtemplates',
    'processhtml',
    'usemin',
    'concat:template',
    'ngmin',
    'copy:dist',
    'cssmin',
    'uglify',
    'revision',
    'revreplace',
    'cdnify'
  );
});

gulp.task('build:test', function(){
  $.runSequence(
    'clean',
    'copy:index',
    'injector:js',
    'injector:scss',
    'sass',
    'bower',
    'imgmin',
    'ngtemplates',
    'processhtml',
    'usemin',
    'concat:template',
    'ngmin',
    'copy:dist',
    'cssmin',
    'uglify',
    'revision',
    'revreplace',
    'cdnify:test'
  );
});


