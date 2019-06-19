vCards CN
=====

导入常用联系人头像，优化 iOS 来电、信息界面体验。

![Screenshot](https://user-images.githubusercontent.com/2666735/59692672-0b6bdf00-9218-11e9-881e-5856e263f3aa.png)

## 使用方法

 1. 到 https://github.com/metowolf/vCards/releases 下载最新的打包文件
 2. 解压后，双击选定的 `vcf` 文件执行导入

## 请求收录

 1. 打开 https://github.com/metowolf/vCards/issues/new 页面
 2. 填写相关信息
 3. 提交 `issue`，等待处理

## 参与维护

 1. 在 `/data/类别/` 里添加 `yaml` 与 `png` 文件
 2. 在根目录下执行 `yarn test` 检查格式规范
 3. 提交 `pull requests`，等待合并

## 号码收录

106 短信号段如满足以下规则可被收录
 - 固定短号，如金融银行等
 - 在 [114 百事通](http://www.114best.com/) 收录，且非首次查询
 - 在 [百度手机卫士](https://haoma.baidu.com/yellowPage) 收录，且在个人设备上收到 2 次及以上讯息

由于不同地区不同运营商的 106 短信号段存在差异，项目不作过多收录，建议将本项目作为一个基础模板，导入联系人后可以按以下方式自行补充其余号码

![Screenshot](https://user-images.githubusercontent.com/2666735/59747105-ccd33480-92aa-11e9-90e0-93f295dcb504.png)


## 图标设计

 - 采用 `PNG` 编码
 - 画布大小 `200w200h`
 - logo 设置 `max(w, h) = 140`，居中放置
   - logo 为纯色时，画布采用主体色，logo 填充为白色
   - logo 不为纯色时，画布采用纯白
   - 特殊情况特殊处理
 - 图像大小压缩在 `20 kB` 内

![Design](https://user-images.githubusercontent.com/2666735/59700723-876d2380-9226-11e9-8e40-381aa630168a.png)
