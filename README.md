vCards CN
=====

导入常用联系人头像，优化 iOS 来电、信息界面体验。

![Screenshot](https://user-images.githubusercontent.com/2666735/59692672-0b6bdf00-9218-11e9-881e-5856e263f3aa.png)

## 使用方法

 1. 到 https://github.com/metowolf/vCards/releases 下载最新的打包文件
 2. 解压后，双击选定的 `vcf` 文件执行导入

## 请求收录

 1. 打开 https://github.com/metowolf/vCards/issues/new/choose 页面，选择「vCard 新增请求」
 2. 完整填写相关信息
 3. 提交 `issue`，等待处理

## 参与维护

 1. 在 `/data/类别/` 里添加 `yaml` 与 `png` 文件
 2. 在根目录下执行 `yarn test` 检查格式规范
 3. 提交 `pull requests`，等待合并

## 号码收录

由于不同地区不同运营商的 106 短信推送号段存在差异，项目不作收录，建议将本项目作为一个基础模板，导入联系人后可以按以下方式自行补充其余号码

![Screenshot](https://user-images.githubusercontent.com/2666735/59747105-ccd33480-92aa-11e9-90e0-93f295dcb504.png)


## 图标设计

 - 采用 `PNG` 编码
 - 画布大小 `200w200h`
 - logo 居中放置
   - 圆形尺寸 140w140h
   - 正矩形尺寸 120w120h
   - 长矩形尺寸 160w80h
   - 无 svg 需要使用 Inkscape 改绘转换
   - 特殊情况特殊处理
 - 图像大小压缩在 `20 kB` 内

![Design](https://user-images.githubusercontent.com/2666735/59700723-876d2380-9226-11e9-8e40-381aa630168a.png)

## 致谢

 - [114 百事通](http://www.114best.com/)提供查询接口
 - [百度手机卫士](https://haoma.baidu.com/yellowPage)提供查询接口
 - [中国可信号码数据中心](https://www.kexinhaoma.org/)提供查询接口
