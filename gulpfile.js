var gulp = require('gulp'),
    test = require('gulp-jasmine');

gulp.task('default', function() {
  return gulp.src('spec/*.js').
    pipe(test({ verbose: true }));
});
