# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个中国常用联系人头像库（vCards），为 iOS/macOS 设备提供企业和机构的联系人信息，用于优化来电和信息界面体验。项目生成 vCard 格式的联系人文件，并支持通过 CardDAV 服务分发。

技术栈：Bun（运行时 / 包管理 / 测试）+ TypeScript（严格模式，`tsc --noEmit` 校验）。

## 核心架构

### 文件结构
- `data/` - 按分类存储的 YAML 数据文件和对应的 PNG 图标
  - 每个条目包含一个 `.yaml` 配置文件和一个 `.png` 图标文件
  - YAML 文件包含 `basic` 对象，包含 `organization`、`cellPhone`、`url`、`workEmail` 等字段
  - 图标优先使用 512x512px（≤50KB），也支持 200x200px（≤20KB）的 PNG 格式
- `src/` - TypeScript 源码，由 Bun 直接运行，无需编译产物
  - `src/build.ts` - 构建入口（CLI，`bun run src/build.ts <task>`）
  - `src/data.test.ts` - 数据校验测试（`bun test`）
  - `src/core/data.ts` - YAML 扫描与解析
  - `src/core/git.ts` - 读取 yaml/png 的 git 提交时间（REV）
  - `src/core/vcard.ts` - vCard 渲染（标准版与 CardDAV 版共用）
  - `src/const/` - Zod schema（`schema.ts`）与不收录名单（`block.ts`）
  - `src/utils/` - PNG 校验、拼音、并发池等纯函数

### 构建系统
- 运行时与包管理器为 Bun，TypeScript 通过 `tsc --noEmit` 做类型检查
- 两个主要的生成流程（`src/build.ts` 中的 task）：
  - `build` - 标准 vCard 生成，产出 `temp/` 与 `public/`
  - `radicale` - CardDAV 版本，附加 UID 与 git 提交时间 REV，产出 `radicale/`
- 支持生成分类文件夹和汇总文件（`temp/汇总/<分类>.all.vcf`、`temp/汇总/全部.vcf`）
- 支持生成 Radicale CardDAV 服务所需的文件结构
- 构建产物与旧版 Node 实现逐字节一致（标准版仅 REV 为构建时间）

### vCard 渲染
- `src/core/vcard.ts` 的 `renderVCard(yamlPath, options)` 为统一入口
- 不传 `options.carddav` 时生成标准 vCard；传入 `{ carddav: { revision } }` 时写入
  稳定的 UID 与基于 git 提交时间的 REV（对应原来的 `vcard-ext` 插件）
- 使用 `vcards-js` 库生成 vCard 格式，带标签的号码/邮箱通过 `X-ABLabel` 拼接
- 自动添加拼音字段（`X-PHONETIC-ORG`）用于中文排序，并按 RFC 2426 折行

## 常用命令

### 开发和测试
```bash
# 安装依赖
bun install

# 运行数据格式检查和 schema 验证
bun test

# TypeScript 类型检查
bun run typecheck

# 构建标准版本（用于发布）
bun run build

# 构建 CardDAV 服务版本
bun run radicale
```

## 数据验证和规范

### Schema 验证
- 使用 Zod 进行数据验证，配置在 `src/const/schema.ts`
- 电话号码使用 Zod 的 `z.e164()` 校验，未带 `+` 的号码自动补 `+86`
- 支持中国区号格式和国际格式（带 `+` 的保持原区号）

### 测试规范
- 图标必须是合法的 PNG 格式（优先 512x512px ≤50KB，也支持 200x200px ≤20KB）
- YAML 数据必须符合定义的 schema
- 检查阻止列表（`src/const/block.js`）中的机构

### 添加新条目
1. 在对应的 `data/分类/` 目录下添加 `.yaml` 和 `.png` 文件
2. 运行 `bun test` 检查格式规范
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
- **标准版本**（`bun run build`）：`renderVCard()` 不传 `carddav` 选项，适用于一般用户
- **CardDAV 版本**（`bun run radicale`）：传入 `carddav: { revision }`，添加稳定的 UID 和基于 git 的 REV 字段

### Git 时间戳集成
- CardDAV 版本通过 `src/core/git.ts` 使用 `git log` 获取文件最后修改时间（并发上限 8）
- REV 字段使用 YAML 和 PNG 文件中较新的时间戳
- 确保 CardDAV 客户端能正确检测更新

### 拼音处理
- 使用 `pinyin-pro` 库生成拼音（`src/utils/pinyin.ts`）
- 自动为中文机构名添加 `X-PHONETIC-ORG` 字段
- 支持通讯录中的中文排序功能

## 注意事项

- 不支持 SVG 图标，必须转换为 PNG
- 图标设计规范：圆形 140x140px，正方形 120x120px，长方形 160x80px
- 所有文本编码使用 UTF-8
- 项目使用 Bun + TypeScript，源码由 Bun 直接运行（ES 模块语法）
- `zip` 命令用于打包 `public/archive.zip`，为 `build` 任务的外部依赖
- CardDAV 版本使用 `bun run radicale` 确保包含完整的元数据

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