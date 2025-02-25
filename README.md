vCards CN
=====

导入常用联系人头像，优化 iOS 来电、信息界面体验。

![Screenshot](https://user-images.githubusercontent.com/2666735/59692672-0b6bdf00-9218-11e9-881e-5856e263f3aa.png)

## 使用指南

### 订阅：CardDAV 服务/ 或参考[教程自建](https://github.com/metowolf/vCards/issues/208)
采用订阅方式导入，优势是会自动更新，也更方便区分和管理个人通讯录和黄页，不会混合两种列表。

 - 服务器：`vcards.metowolf.com`
 - 用户名：`cn`
 - 密码：`cn` 或任意填写

步骤：
1. [iOS](https://support.apple.com/zh-cn/guide/iphone/ipha0d932e96/ios)：「设置」--「通讯录」--「账户」--「添加账户」-- 「其他」--「添加 CardDAV 账户」
2. [Mac](https://support.apple.com/zh-cn/guide/contacts/adrb7e5aaa2a/mac)：「通讯录」--「设置」--「账户」--「其他通讯录账户」

⚠️ 注意：默认 iOS 获取新资料的方式为「自动」，该情况只会在连接电源和 WLAN 的情况下才会进行数据推送，可以适当等待一段时间。

### 下载导入

1. 到 https://github.com/metowolf/vCards/releases 下载最新的打包文件 `archive.zip`；
2. 解压后，根据不同平台的指南导入 `vcf` 文件至 iCloud 中，推荐单独创建「黄页」分组方便管理和隐藏。

#### macOS
 - [在 Mac 上的“通讯录”中创建联系人群组](https://support.apple.com/zh-cn/guide/contacts/adrb3280fe91/12.0/mac/10.14)
 - [在 Mac 上的“通讯录”中导入来自其他应用的联系人](https://support.apple.com/zh-cn/guide/contacts/adrbk1457/mac)

#### iOS/web
 - [在 iCloud 通讯录中创建群组](https://support.apple.com/kb/PH2667?locale=zh_CN)
 - [将联系人导入 iCloud 通讯录](https://support.apple.com/kb/ph3605?locale=zh_CN)

----

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
 - 画布大小 `width：200px；height：200px`
 - logo 居中放置
   - 圆形尺寸 140w140h
   - 正矩形尺寸 120w120h
   - 长矩形尺寸 160w80h
   - 无 svg 需要使用 Inkscape 改绘转换
   - 特殊情况特殊处理
 - 图像大小压缩在 `20 kB` 内

![Design](https://user-images.githubusercontent.com/2666735/60966995-224fae00-a34c-11e9-970c-ea5fa15186c6.png)

## 致谢

 - [114 百事通](http://www.114best.com/)提供查询接口
 - [百度手机卫士](https://haoma.baidu.com/yellowPage)提供查询接口
 - [中国可信号码数据中心](https://www.kexinhaoma.org/)提供查询接口
