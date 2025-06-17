# vCards CN

导入常用联系人头像，优化 iOS 来电、信息界面体验。

![Screenshot](https://user-images.githubusercontent.com/2666735/59692672-0b6bdf00-9218-11e9-881e-5856e263f3aa.png)

---

## 使用指南

### 方法一：安装 CardDAV 描述文件（推荐）

1. 使用**系统相机**扫描下方二维码，下载配置描述文件  
>   <a href="https://vcards.metowolf.com/vcards.mobileconfig"><img src="https://github.com/user-attachments/assets/238f9d9a-5aa6-4636-8e67-4829535eaab9" width="150px" height="150px" /></a>

2. 打开“设置”App，轻点“已下载描述文件”或“注册 [组织的名称]”  
>   <img src="https://github.com/user-attachments/assets/12997c2d-6172-49f0-9236-0b4f30ad9ebd" width="300px" />

3. 在右上角点击“安装”，按屏幕提示操作完成导入。

---

<details>
<summary><strong>方法二：手动订阅 CardDAV 服务</strong></summary>

采用订阅方式导入，优势是会自动更新，也方便区分和管理个人通讯录和黄页，避免混合两种列表。

- 服务器：`vcards.metowolf.com`
- 用户名：`cn`
- 密码：`cn` 或任意填写

如担心隐私问题，可参考 [自建教程](https://github.com/metowolf/vCards/issues/208)。

#### 设置步骤

- **iOS**  
  「设置」→「通讯录」→「账户」→「添加账户」→「其他」→「添加 CardDAV 账户」  
  参考：[官方文档](https://support.apple.com/zh-cn/guide/iphone/ipha0d932e96/ios)

- **Mac**  
  「通讯录」→「设置」→「账户」→「其他通讯录账户」  
  参考：[官方文档](https://support.apple.com/zh-cn/guide/contacts/adrb7e5aaa2a/mac)

> ⚠️ 默认 iOS 获取新资料的方式为「自动」，此情况下只有连接电源和 WLAN 时才会推送数据，请耐心等待。

</details>

---

<details>
<summary><strong>方法三：下载导入</strong></summary>

1. 前往 [Releases 页面](https://github.com/metowolf/vCards/releases) 下载最新打包文件 `archive.zip`
2. 解压后，根据不同平台指南导入 `vcf` 文件至 iCloud（建议单独创建「黄页」分组以便管理与隐藏）

#### macOS
- [在 Mac 上的“通讯录”中创建联系人群组](https://support.apple.com/zh-cn/guide/contacts/adrb3280fe91/12.0/mac/10.14)
- [在 Mac 上的“通讯录”中导入来自其他应用的联系人](https://support.apple.com/zh-cn/guide/contacts/adrbk1457/mac)

#### iOS / Web
- [在 iCloud 通讯录中创建群组](https://support.apple.com/kb/PH2667?locale=zh_CN)
- [将联系人导入 iCloud 通讯录](https://support.apple.com/kb/ph3605?locale=zh_CN)

</details>

---

## 请求收录

1. 打开 [新增 vCard 请求](https://github.com/metowolf/vCards/issues/new/choose) 页面，选择「vCard 新增请求」
2. 完整填写相关信息
3. 提交 Issue，等待处理

---

## 参与维护

1. 在 `/data/类别/` 目录下添加 `yaml` 和 `png` 文件
2. 在根目录执行 `yarn test` 检查格式规范
3. 提交 Pull Request，等待合并

---

## 号码收录说明

鉴于不同地区及运营商的 106 短信推送号段存在差异，项目不做统一收录。建议将本项目作为基础模板，导入联系人后可按下图方式自行补充所需号码：

![Screenshot](https://user-images.githubusercontent.com/2666735/59747105-ccd33480-92aa-11e9-90e0-93f295dcb504.png)

---

## 图标设计规范

- 采用 `PNG` 编码
- 画布大小：`200px × 200px`
- logo 居中放置：
  - 圆形：140 × 140 px
  - 正方形：120 × 120 px
  - 长方形：160 × 80 px
  - 特殊情况特殊处理
- **不支持 SVG**，如需转换请使用 Inkscape 改绘
- 图像大小压缩在 `20 kB` 内

![Design](https://user-images.githubusercontent.com/2666735/60966995-224fae00-a34c-11e9-970c-ea5fa15186c6.png)

---

## 致谢

- [114 百事通](http://www.114best.com/) 提供查询接口
- [百度手机卫士](https://haoma.baidu.com/yellowPage) 提供查询接口
- [中国可信号码数据中心](https://www.kexinhaoma.org/) 提供查询接口
