vCards CN
=====

导入常用联系人头像，优化 iOS 来电、信息界面体验。

![Screenshot](https://user-images.githubusercontent.com/2666735/59692672-0b6bdf00-9218-11e9-881e-5856e263f3aa.png)


## 参与维护

 1. 在 `/data/类别/` 里添加 `yaml` 与 `png` 文件
 2. 在根目录下执行 `yarn test` 检查格式规范
 3. 提交 `pull requests`，等待合并

## 使用方法

 1. 到 https://github.com/metowolf/vCards/releases 下载最新的打包文件
 2. 解压后，双击选定的 `vcf` 文件执行导入

## 图标设计

 - 采用 PNG 编码
 - 画布大小 200w200h
 - logo 设置 140w，居中放置
   - logo 为纯色时，画布采用主体色，logo 填充为白色
   - logo 不为纯色时，画布采用纯白
   - 特殊情况特殊处理
 - 图像大小压缩在 20 kB 内

![Design](https://user-images.githubusercontent.com/2666735/59697382-4c67f180-9220-11e9-8482-50816f0ebdac.png)
