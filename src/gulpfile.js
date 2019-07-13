const del = require('del')
const path = require('path')
const globby = require('globby')
const through2 = require('through2')

const { series, src, dest } = require('gulp')
const ava = require('gulp-ava')
const zip = require('gulp-zip')
const concat = require('gulp-concat')
const rename = require("gulp-rename")
const concatFolders = require('gulp-concat-folders')

const plugin_vcard = require('./plugins/vcard')

const generator = () => {
  return src('data/*/*.yaml')
    .pipe(through2.obj(plugin_vcard))
    .pipe(rename({ extname: '.vcf' }))
    .pipe(dest('./temp'))
}

const archive = () => {
  return src('temp/**')
    .pipe(zip('archive.zip'))
    .pipe(dest('./public'))
}

const combine = () => {
  return src('temp/*/*.vcf')
    .pipe(concatFolders('汇总'))
    .pipe(rename({ extname: '.all.vcf' }))
    .pipe(dest('./temp'))
}

const allinone = () => {
  return src('temp/汇总/*.all.vcf')
    .pipe(concat('全部.vcf'))
    .pipe(dest('./temp/汇总'))
}

const test = () => {
  return src('./src/test.js')
    .pipe(ava({verbose: true}))
}

const clean = () => {
  return del([
    'public',
    'temp'
  ])
}

exports.test = test
exports.generator = generator
exports.combine = combine
exports.allinone = allinone
exports.archive = archive
exports.build = series(test, clean, generator, combine, allinone, archive)
