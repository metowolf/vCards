import fs from 'fs'
import path from 'path'
import { deleteAsync } from 'del'
import through2 from 'through2'

import gulp from 'gulp'
import zip from 'gulp-zip'
import concat from 'gulp-concat'
import rename from 'gulp-rename'
import concatFolders from 'gulp-concat-folders'

import plugin_vcard from './plugins/vcard.js'
import plugin_vcard_ext from './plugins/vcard-ext.js'

const generator = () => {
  return gulp.src('data/*/*.yaml')
    .pipe(through2.obj(plugin_vcard))
    .pipe(rename({ extname: '.vcf' }))
    .pipe(gulp.dest('./temp'))
}

const generator_ext = () => {
  return gulp.src('data/*/*.yaml')
    .pipe(through2.obj(plugin_vcard_ext))
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
  return deleteAsync([
    'public',
    'temp'
  ])
}

const createRadicale = () => {
  let folders = fs.readdirSync('temp')
    .filter(function(f) {
      return fs.statSync(path.join('temp', f)).isDirectory();
    })
  folders.map(function(folder){
    const fileCount = fs.readdirSync(path.join('temp', folder))
      .filter(file => file.endsWith('.vcf'))
      .length;
    fs.writeFileSync(
      path.join('temp', folder, '/.Radicale.props'), 
      `{"D:displayname": "${folder}(${fileCount})", "tag": "VADDRESSBOOK"}`
    )
  })
  return gulp.src('temp/**', {})
}

const cleanRadicale = () => {
  return deleteAsync([
    'radicale'
  ], {force: true})
}

const distRadicale = () => {
  return gulp.src('temp/**', {dot: true})
    .pipe(gulp.dest('./radicale/ios'))
}

const distRadicaleMacos = (done) => {
  const macosDir = './radicale/macos';
  if (!fs.existsSync(macosDir)) fs.mkdirSync(macosDir, {recursive: true});
  let totalCount = 0;
  // 1. 复制所有 vcf 文件
  const tempFolders = fs.readdirSync('temp').filter(f => fs.statSync(path.join('temp', f)).isDirectory());
  tempFolders.forEach(folder => {
    const folderPath = path.join('temp', folder);
    const vcfFiles = fs.readdirSync(folderPath).filter(f => f.endsWith('.vcf'));
    vcfFiles.forEach(file => {
      fs.copyFileSync(path.join(folderPath, file), path.join(macosDir, file));
    });
    totalCount += vcfFiles.length;
  });
  // 2. 只生成一个 props 文件
  fs.writeFileSync(
    path.join(macosDir, '.Radicale.props'),
    `{"D:displayname": "全部(${totalCount})", "tag": "VADDRESSBOOK"}`
  );
  done();
}

const build = gulp.series(clean, generator, combine, allinone, archive)
const radicale = gulp.series(
  clean,
  generator_ext,
  createRadicale,
  cleanRadicale,
  gulp.parallel(distRadicale, distRadicaleMacos)
)

export {
  generator,
  combine,
  allinone,
  archive,
  build,
  radicale
}