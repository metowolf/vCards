# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个中国常用联系人头像库（vCards），为 iOS/macOS 设备提供企业和机构的联系人信息，用于优化来电和信息界面体验。项目生成 vCard 格式的联系人文件，并支持通过 CardDAV 服务分发。

## 核心架构

### 数据结构
- `data/` - 按分类存储的 YAML 数据文件和对应的 PNG 图标
  - 每个条目包含一个 `.yaml` 配置文件和一个 `.png` 图标文件
  - YAML 文件包含 `basic` 对象，包含 `organization`、`cellPhone`、`url`、`workEmail` 等字段
  - 图标必须是 200x200px 的 PNG 格式，文件大小不超过 20KB

### 构建系统
- 使用 Gulp 作为构建工具，配置文件在 `src/gulpfile.js`
- 两个主要的生成流程：
  - `generator` - 标准 vCard 生成，过滤 106 长号码
  - `generator_ext` - 扩展版本，保留所有号码
- 支持生成分类文件夹和汇总文件
- 支持生成 Radicale CardDAV 服务所需的文件结构

### 插件系统
- `src/plugins/vcard.js` - 标准 vCard 生成插件
- `src/plugins/vcard-ext.js` - 扩展版 vCard 生成插件
- 使用 `vcards-js` 库生成 vCard 格式
- 自动添加拼音字段用于中文排序

## 常用命令

### 开发和测试
```bash
# 运行格式检查和数据验证
npm test
# 或使用 yarn
yarn test

# 构建标准版本（用于发布）
npm run build

# 构建 CardDAV 服务版本
npm run radicale
```

### Gulp 任务
```bash
# 生成 vCard 文件到 temp 目录
npm run gulp generator

# 生成分类汇总文件
npm run gulp combine

# 生成总汇总文件
npm run gulp allinone

# 创建压缩包
npm run gulp archive

# 完整构建流程
npm run gulp build

# CardDAV 服务构建
npm run gulp radicale
```

## 数据验证和规范

### Schema 验证
- 使用 Joi 进行数据验证，配置在 `src/const/schema.js`
- 电话号码使用 `google-libphonenumber` 进行验证
- 支持中国区号格式和国际格式

### 测试规范
- 图标必须是合法的 PNG 格式（200x200px，<20KB）
- YAML 数据必须符合定义的 schema
- 检查阻止列表（`src/const/block.js`）中的机构

### 添加新条目
1. 在对应的 `data/分类/` 目录下添加 `.yaml` 和 `.png` 文件
2. 运行 `npm test` 检查格式规范
3. YAML 文件必须包含：
   - `basic.organization` - 机构名称
   - `basic.cellPhone` - 电话号码数组
   - `basic.url` - 官网链接（可选）
   - `basic.workEmail` - 邮箱数组（可选）

## 特殊处理

### 电话号码过滤
- 标准版本会过滤掉 106 开头的长号码（超过11位）
- 扩展版本保留所有号码

### 中文支持
- 自动生成拼音字段用于通讯录排序
- 使用 `pinyin-pro` 库进行拼音转换

### CardDAV 服务
- 生成 Radicale 兼容的目录结构
- iOS 版本按分类生成文件夹
- macOS 版本将所有联系人合并到一个文件夹

## 输出文件

- `temp/` - 临时生成的 vCard 文件
- `public/archive.zip` - 打包的发布文件
- `radicale/ios/` - iOS CardDAV 服务文件
- `radicale/macos/全部/` - macOS CardDAV 服务文件

## 注意事项

- 不支持 SVG 图标，必须转换为 PNG
- 图标设计规范：圆形 140x140px，正方形 120x120px，长方形 160x80px
- 所有文本编码使用 UTF-8
- 项目使用 ES 模块语法（`"type": "module"`）