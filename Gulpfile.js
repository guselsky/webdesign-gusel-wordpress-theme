var project     = 'webdesign-gusel',
gulp            = require('gulp'),
watch           = require('gulp-watch'),
browserSync     = require('browser-sync').create(),
reload          = browserSync.reload,
autoprefixer    = require('gulp-autoprefixer'),
sass            = require('gulp-sass'),
webpack         = require('webpack'),
useref          = require('gulp-useref'),
modernizr       = require('gulp-modernizr'),
uglify          = require('gulp-uglify'),
gulpIf          = require('gulp-if'),
cssnano         = require('gulp-cssnano'),
imagemin        = require('gulp-imagemin'),
cache           = require('gulp-cache'),
del             = require('del'),
runSequence     = require('run-sequence'),
notify          = require("gulp-notify"),
ignore          = require('gulp-ignore'),
rimraf          = require('gulp-rimraf'),
zip             = require('gulp-zip'),
cache           = require('gulp-cache'),
build           = './buildtheme/',
buildInclude    = [

// include common file types
        '**/*.php',
        '**/*.html',
        '**/*.css',
        '**/*.js',
        '**/*.svg',
        '**/*.jpg',
        '**/*.png',
        '**/*.ttf',
        '**/*.otf',
        '**/*.eot',
        '**/*.woff',
        '**/*.woff2',

        // include specific files and folders
        'screenshot.png',

        // exclude files and folders
        '!node_modules/**/*',
        '!buildtheme/**/*',
        '!development/**/*',
        '!gulp/**/*',
        '!Gulpfile.js',
        '!footer-fullwidth.php',
        '!footer-old.php',
        '!header-centered.php',
        '!header-fullwidth.php',
        '!header-stretched.php',
        '!page-home-2.php',
        '!page-home-old.php',
        '!page-home-picture-blurbs.php',
        '!webpack.config.js',
        '!scripts/modernizr.js'
];

// Default Task
gulp.task('default', function (callback) {
  runSequence(['sass','browserSync', 'watch'],
    callback
  )
});

gulp.task('watch', ['browserSync', 'sass'], function() {

    gulp.watch('sass/**/*.scss', ['sass']);
    gulp.watch('*.php', browserSync.reload); 
    gulp.watch('inc/**/*.php', browserSync.reload); 
    gulp.watch('js/**/*.js', ['scriptsRefresh'], browserSync.reload); 
});

// Sass task, will run when any SCSS files change & BrowserSync
// will auto-update browsers
gulp.task('sass', function () {
    return gulp.src('sass/**/*.scss')
        .pipe(sass({     
            includePaths: require('node-normalize-scss').includePaths
        }))
        // Prevents watch task from quitting on CSS error
        .on('error', function(errorInfo) {
            console.log(errorInfo.toString());
            this.emit('end');
        })
         .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(cssnano())
        .pipe(gulp.dest('./'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

gulp.task('browserSync', function() {
    //watch files
    var files = [
    './style.css',
    './*.php',
    './js/**/*.js'
    ];
 
    //initialize browsersync
    browserSync.init(files, {
    //browsersync with a php server
    proxy: "localhost/webdesign-gusel",
    notify: false
    });
});

gulp.task('scripts', ['modernizr'], function(callback) {
    webpack(require('./webpack.config.js'), function(err, stats) {
        if(err) {
            console.log(err.toString());
        }

        console.log(stats.toString());
        callback();
    });
});

gulp.task('scriptsRefresh', ['scripts'], function() {
    browserSync.reload();
});

gulp.task('modernizr', function() {
    return gulp.src(['./sass/**/*.css', './js/**/*.js'])
    .pipe(modernizr({
        'options': [
            'setClasses'
        ]
    }))
    .pipe(gulp.dest('./scripts/'));
});

// Delete The Dist folder

gulp.task('deleteDistFolder', function() {
  return del('./dist');
});

// Delete the buildtheme folder

gulp.task('deleteBuildthemeFolder', function() {
  return del('./buildtheme');
});

// Build a WordPress Theme zip file

  gulp.task('buildFiles', ['deleteDistFolder', 'deleteBuildthemeFolder'], function() {
    return  gulp.src(buildInclude)
        .pipe(gulp.dest(build))
        .pipe(notify({ message: 'Copy from buildFiles complete', onLast: true }));
  });


 /**
  * Zipping build directory for distribution
  *
  * Taking the build folder, which has been cleaned, containing optimized files and zipping it up to send out as an installable theme
 */
 gulp.task('buildZip', ['buildFiles'], function () {
  // return   gulp.src([build+'/**/', './.jshintrc','./.bowerrc','./.gitignore' ])
  return  gulp.src(build+'/**/')
    .pipe(zip(project+'.zip'))
    .pipe(gulp.dest('./dist'))
    .pipe(notify({ message: 'Zip task complete', onLast: true }));
 });


 // Package Distributable Theme
 gulp.task('build', function(cb) {
  runSequence('sass','deleteBuildthemeFolder','deleteDistFolder', 'buildFiles', 'buildZip', cb);
});