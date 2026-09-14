# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个中国常用联系人头像库（vCards），为 iOS/macOS 设备提供企业和机构的联系人信息，用于优化来电和信息界面体验。项目生成 vCard 格式的联系人文件，并支持通过 CardDAV 服务分发。

## 核心架构

### 数据结构
- `data/` - 按分类存储的 YAML 数据文件和对应的 PNG 图标
  - 每个条目包含一个 `.yaml` 配置文件和一个 `.png` 图标文件
  - YAML 文件包含 `basic` 对象，包含 `organization`、`cellPhone`、`url`、`workEmail` 等字段
  - 图标优先使用 512x512px（≤50KB），也支持 200x200px（≤20KB）的 PNG 格式

### 构建系统
- 使用纯 Node 脚本作为构建工具，配置文件在 `src/build.js`
- 两个主要的生成流程：
  - `generator` - 标准 vCard 生成
  - `generator_ext` - 扩展版本，添加 git 历史时间戳
- 支持生成分类文件夹和汇总文件
- 支持生成 Radicale CardDAV 服务所需的文件结构

### 插件系统
- `src/plugins/vcard.js` - 标准 vCard 生成插件
- `src/plugins/vcard-ext.js` - 扩展版 vCard 生成插件，包含 REV 字段和 UID
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

## 数据验证和规范

### Schema 验证
- 使用 Zod 进行数据验证，配置在 `src/const/schema.js`
- 电话号码使用 Zod 的 `z.e164()` 校验，未带 `+` 的号码自动补 `+86`
- 支持中国区号格式和国际格式（带 `+` 的保持原区号）

### 测试规范
- 图标必须是合法的 PNG 格式（优先 512x512px ≤50KB，也支持 200x200px ≤20KB）
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
   - `basic` 至少包含 `cellPhone`、`workEmail`、`url` 之一

## 特殊处理

### 电话号码收录
- 数据不收录 106 开头的短信推送长号码（超过11位）

### 中文支持
- 自动生成拼音字段用于通讯录排序
- 使用 `pinyin-pro` 库进行拼音转换

### CardDAV 服务
- 生成 Radicale 兼容的目录结构
- iOS 版本按分类生成文件夹
- macOS 版本将所有联系人合并到一个文件夹

## 输出文件

- `temp/` - 临时生成的 vCard 文件，按分类组织
- `public/archive.zip` - 打包的发布文件
- `radicale/ios/` - iOS CardDAV 服务文件，按分类分文件夹
- `radicale/macos/全部/` - macOS CardDAV 服务文件，所有联系人在一个文件夹

## 关键技术细节

### vCard 生成差异
- **标准版本** (`vcard.js`)：适用于一般用户
- **扩展版本** (`vcard-ext.js`)：添加 REV 和 UID 字段，适用于 CardDAV

### Git 时间戳集成
- 扩展版本使用 `git log` 获取文件最后修改时间
- REV 字段使用 YAML 和 PNG 文件中较新的时间戳
- 确保 CardDAV 客户端能正确检测更新

### 拼音处理
- 使用 `pinyin-pro` 库生成拼音
- 自动为中文机构名添加 `X-PHONETIC-ORG` 字段
- 支持通讯录中的中文排序功能

## 注意事项

- 不支持 SVG 图标，必须转换为 PNG
- 图标设计规范：圆形 140x140px，正方形 120x120px，长方形 160x80px
- 所有文本编码使用 UTF-8
- 项目使用 ES 模块语法（`"type": "module"`）
- CardDAV 版本使用 `npm run radicale` 确保包含完整的元数据

## 图标标准化处理

项目优先使用 512x512px 的 PNG 格式，文件大小不超过 50KB。也支持 200x200px（≤20KB）作为备选。Issue 中提供的图标通常尺寸过大（如 1024x1024），需要缩放处理。

### 处理步骤

1. **下载原始图标**：从 GitHub issue 或评论中的 `user-attachments` 链接下载 PNG 文件
2. **检查原始尺寸**：使用 `file` 命令确认格式和尺寸
3. **缩放处理**：使用 Python Pillow 进行缩放（优先 512x512）
   ```python
   from PIL import Image
   img = Image.open('input.png')
   img = img.convert('RGBA')
   img = img.resize((512, 512), Image.LANCZOS)
   img.save('output.png', 'PNG', optimize=True)
   ```
4. **验证结果**：确认输出为 PNG 格式、512x512px、文件大小 < 50KB

### 环境依赖

- 图片缩放依赖 `Pillow`，如未安装可通过 `pip3 install Pillow` 安装
- 环境中通常没有 ImageMagick（`convert`/`magick`）或 ffmpeg，优先使用 Python 方案
- Node.js `canvas` 模块通常也不可用

### 规格要求

- 格式：PNG（不支持 SVG）
- 尺寸：优先 512x512px（≤50KB），也支持 200x200px（≤20KB）
- 设计参考：圆形图标有效区域 140x140px，正方形 120x120px，长方形 160x80px