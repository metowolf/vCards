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
import yaml from 'js-yaml'

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

const cleanWeb = () => {
  return deleteAsync([
    'public-web'
  ])
}

// 网页版本构建任务
const webBuild = async () => {
  try {
    const { globby } = await import('globby')
    const vcardsData = []
    
    // 读取所有 YAML 文件
    const yamlFiles = await globby('data/*/*.yaml')
    
    for (const filePath of yamlFiles) {
      const content = fs.readFileSync(filePath, 'utf8')
      const data = yaml.load(content)
      
      if (data && data.basic) {
        const fileName = path.basename(filePath, '.yaml')
        const categoryPath = path.dirname(filePath)
        const category = path.basename(categoryPath)
        
        vcardsData.push({
          organization: data.basic.organization,
          phones: data.basic.cellPhone || [],
          url: data.basic.url || null,
          emails: data.basic.workEmail || [],
          category: category,
          filename: fileName
        })
      }
    }
    
    console.log(`正在构建网页版本，共 ${vcardsData.length} 个联系人...`)
    
    // 构建网页
    await buildWebsite(vcardsData)
    
    console.log('网页版本构建完成，输出到: ./public-web')
  } catch (error) {
    console.error('构建网页版本时出错:', error)
    throw error
  }
}

// 构建网站函数
async function buildWebsite(vcardsData) {
  const outputDir = './public-web'
  const templateDir = './src/templates'
  
  // 确保输出目录存在
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }
  
  // 创建子目录
  const iconsDir = path.join(outputDir, 'icons')
  const vcfDir = path.join(outputDir, 'vcf')
  
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true })
  }
  if (!fs.existsSync(vcfDir)) {
    fs.mkdirSync(vcfDir, { recursive: true })
  }
  
  // 复制模板文件并注入数据
  copyTemplateFiles(templateDir, outputDir, vcardsData)
  
  // 复制图标文件
  copyIconFiles(iconsDir, vcardsData)
  
  // 复制 VCF 文件（从临时目录）
  copyVcfFiles(vcfDir, vcardsData)
}

/**
 * 复制模板文件并注入数据
 */
function copyTemplateFiles(templateDir, outputDir, vcardsData) {
  // 复制 HTML 文件并注入数据
  const htmlTemplate = fs.readFileSync(path.join(templateDir, 'index.html'), 'utf8')
  const jsTemplate = fs.readFileSync(path.join(templateDir, 'app.js'), 'utf8')
  
  // 生成数据注入脚本
  const dataScript = `window.VCARDS_DATA = ${JSON.stringify(vcardsData, null, 2)};`
  
  // 将数据脚本和应用脚本合并
  const finalJs = dataScript + '\n\n' + jsTemplate
  
  // 写入文件
  fs.writeFileSync(path.join(outputDir, 'index.html'), htmlTemplate)
  fs.writeFileSync(path.join(outputDir, 'app.js'), finalJs)
  fs.copyFileSync(path.join(templateDir, 'styles.css'), path.join(outputDir, 'styles.css'))
}

/**
 * 复制图标文件
 */
function copyIconFiles(iconsDir, vcardsData) {
  const processedCategories = new Set()
  
  vcardsData.forEach(item => {
    const categoryDir = path.join(iconsDir, item.category)
    
    // 为每个分类创建目录
    if (!processedCategories.has(item.category)) {
      if (!fs.existsSync(categoryDir)) {
        fs.mkdirSync(categoryDir, { recursive: true })
      }
      processedCategories.add(item.category)
    }
    
    // 复制图标文件
    const sourcePath = path.join('data', item.category, `${item.filename}.png`)
    const targetPath = path.join(categoryDir, `${item.filename}.png`)
    
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, targetPath)
    } else {
      console.warn(`图标文件不存在: ${sourcePath}`)
    }
  })
}

/**
 * 复制 VCF 文件
 */
function copyVcfFiles(vcfDir, vcardsData) {
  const processedCategories = new Set()
  
  vcardsData.forEach(item => {
    const categoryDir = path.join(vcfDir, item.category)
    
    // 为每个分类创建目录
    if (!processedCategories.has(item.category)) {
      if (!fs.existsSync(categoryDir)) {
        fs.mkdirSync(categoryDir, { recursive: true })
      }
      processedCategories.add(item.category)
    }
    
    // 复制 VCF 文件
    const sourcePath = path.join('temp', item.category, `${item.filename}.vcf`)
    const targetPath = path.join(categoryDir, `${item.filename}.vcf`)
    
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, targetPath)
    } else {
      console.warn(`VCF 文件不存在: ${sourcePath}`)
    }
  })
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

// 新增：所有 vcf 和 props 放到 radicale/macos/全部/
const distRadicaleMacos = (done) => {
  const allDir = './radicale/macos/全部';
  if (!fs.existsSync(allDir)) fs.mkdirSync(allDir, {recursive: true});
  let totalCount = 0;
  // 1. 复制所有 vcf 文件到 radicale/macos/全部/
  const tempFolders = fs.readdirSync('temp').filter(f => fs.statSync(path.join('temp', f)).isDirectory());
  tempFolders.forEach(folder => {
    const folderPath = path.join('temp', folder);
    const vcfFiles = fs.readdirSync(folderPath).filter(f => f.endsWith('.vcf'));
    vcfFiles.forEach(file => {
      fs.copyFileSync(path.join(folderPath, file), path.join(allDir, file));
    });
    totalCount += vcfFiles.length;
  });
  // 2. 只在 radicale/macos/全部/ 下生成一个 props 文件
  fs.writeFileSync(
    path.join(allDir, '.Radicale.props'),
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

// 网页版本完整构建流程
const buildWeb = gulp.series(cleanWeb, generator, webBuild)

export {
  generator,
  combine,
  allinone,
  archive,
  build,
  radicale,
  buildWeb
}