# AGENTS.md

## 图标标准化处理

项目要求所有图标为 200x200px 的 PNG 格式，文件大小不超过 20KB。Issue 中提供的图标通常尺寸过大（如 1024x1024），需要缩放处理。

### 处理步骤

1. **下载原始图标**：从 GitHub issue 或评论中的 `user-attachments` 链接下载 PNG 文件
2. **检查原始尺寸**：使用 `file` 命令确认格式和尺寸
3. **缩放处理**：使用 Python Pillow 进行缩放
   ```python
   from PIL import Image
   img = Image.open('input.png')
   img = img.convert('RGBA')
   img = img.resize((200, 200), Image.LANCZOS)
   img.save('output.png', 'PNG', optimize=True)
   ```
4. **验证结果**：确认输出为 PNG 格式、200x200px、文件大小 < 20KB

### 环境依赖

- 图片缩放依赖 `Pillow`，如未安装可通过 `pip3 install Pillow` 安装
- 环境中通常没有 ImageMagick（`convert`/`magick`）或 ffmpeg，优先使用 Python 方案
- Node.js `canvas` 模块通常也不可用

### 规格要求

- 格式：PNG（不支持 SVG）
- 尺寸：200x200px
- 大小：不超过 20KB
- 设计参考：圆形图标有效区域 140x140px，正方形 120x120px，长方形 160x80px
