const path = require('path')
const globby = require('globby')
const through2 = require('through2')

const gulp = require('gulp')
const ava = require('gulp-ava')
const zip = require('gulp-zip')
const concat = require('gulp-concat')
const rename = require("gulp-rename")

const plugin_vcard = require('./plugins/vcard')

gulp.task('generator', () => {
  return gulp.src('data/*/*.yaml')
    .pipe(through2.obj(plugin_vcard))
    .pipe(rename({ extname: '.vcf' }))
    .pipe(gulp.dest('./temp'))
})

gulp.task('archive', () => {
  return gulp.src(['temp/*/*.vcf', 'temp/*.all.vcf'])
    .pipe(zip('archive.zip'))
    .pipe(gulp.dest('./public'))
})

gulp.task('concat', async () => {
  const paths = await globby('temp/*', { onlyFiles: false })
  const types = paths.map(x => x.split('/')[1])
  const promises = types.map(type => {
    return gulp.src(`temp/${type}/*.vcf`)
      .pipe(concat(`${type}.all.vcf`))
      .pipe(gulp.dest('./temp'))
  })
  await Promise.all(promises)
  return gulp.src('temp/*.all.vcf')
    .pipe(concat(`all.vcf`))
    .pipe(gulp.dest('./public'))
})

gulp.task('test', () => {
  return gulp.src('src/test.js')
    .pipe(ava({verbose: true}))
})

gulp.task('build', gulp.series('test', 'generator', 'concat', 'archive'))
