import del from 'del'
import through2 from 'through2'

import gulp from 'gulp'
import zip from 'gulp-zip'
import concat from 'gulp-concat'
import rename from 'gulp-rename'
import concatFolders from 'gulp-concat-folders'

import plugin_vcard from './plugins/vcard.js'

const generator = () => {
  return gulp.src('data/*/*.yaml')
    .pipe(through2.obj(plugin_vcard))
    .pipe(rename({ extname: '.vcf' }))
    .pipe(gulp.dest('./temp'))
}

const archive = () => {
  return gulp.src('temp/**')
    .pipe(zip('archive.zip'))
    .pipe(gulp.dest('./public'))
}

const combine = () => {
  return gulp.src('temp/*/*.vcf')
    .pipe(concatFolders('汇总'))
    .pipe(rename({ extname: '.all.vcf' }))
    .pipe(gulp.dest('./temp'))
}

const allinone = () => {
  return gulp.src('temp/汇总/*.all.vcf')
    .pipe(concat('全部.vcf'))
    .pipe(gulp.dest('./temp/汇总'))
}

const clean = () => {
  return del([
    'public',
    'temp'
  ])
}

const build = gulp.series(clean, generator, combine, allinone, archive)

export {
  generator,
  combine,
  allinone,
  archive,
  build
}