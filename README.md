# kjf-fast-demo

## 正式环境:

```
pkg: 

SHA256证书指纹

# openssl x509 -noout -fingerprint -md5 -inform pem -in certificate.pem
MD5 Fingerprint=

appID: 

appsecret: 

client_id: 

client_secret: 

```

## 如何使用

```bash
npm i

npm start # 推荐 ✅✅

# 或者运行以下命令
npm run server & npm run watch

# 或者在终端一 Tab 下运行: 
npm run server
npm run watch # 在终端另一 Tab 下运行: 

# ✨ 新增「快应用」页面
npm run gen YourPageName
```

用一台 `Android` 手机，下载安装 [「快应用」调试器](https://www.quickapp.cn/docCenter/post/69) ，打开后操作`扫码安装`，扫描如上命令生成的二维码，即可看到效果。

## 内置命令

更推荐您直接使用 [快应用 IDE](https://doc.quickapp.cn/ide/new.html) ，具体可参见 [快应用开发系列博文](https://forum.lovejade.cn/t/quickapp) ；如果您基于 VsCode、SublimeText 等编辑器，开发快应用，以下命令可参考。

|  命令 | 描述  | 备注 |
|---|---|---|
| `npm start`  | 开启服务(server)和监听(watch) 一键启动 ✔️|
| `npm run server`  | 开启服务(server)  | 麻烦，可使用，不推荐 |
| `npm run watch`  | 开启监听(watch)  | 麻烦，可使用，不推荐 |
| `npm run build ` | 编译打包，生成 `rpk`包  | 对内置 `hap build` 命令的转接 |
| `npm run release ` | 生成 `rpk`包并增加签名  | 对内置 `hap release` 命令的转接  |
| `npm run gen `  | 新增「快应用」页面 | 助你高效生成页面，模版可自定义，推荐 ✓|


## 组织结构

```
├── sign                # 存储 rpk 包签名模块;
│   ├── debug           # 调试环境证书/私钥文件
│   └── release         # 正式环境证书/私钥文件
└── src
```

## 改进优势

秉承在 [高效开发 Web 单页应用解决方案](https://nice.lovejade.cn/zh/article/vue-webpack-boilerplate-template.html) 中所传递的理念: 为**高效开发**而设计，具有以下诸多优点: 

- [x] **对项目结构进行优化**；如上组织结构所示，将各资源模块，更专业的分门别类，使之可以便捷的去编写、维护、查找，同时也是基于前端开发既定共识去设计，更容易为初接触者所理解 & 上手；
- [x] **更优雅的处理数据请求**；采用 `Promise` 对系统内置请求 `@system.fetch` 进行封装，并抛出至全局，使得可以极简的进行链式调用，同时便捷地处理返回数据，并能够使用  `finally`，设计详情可参见 [如何优雅处理「快应用」数据请求
](https://quickapp.lovejade.cn/how-to-elegantly-handle-quickapp-request/) ；
- [x] **内置了样式处理方案**；「快应用」支持 `less`, `sass` 的预编译；这里采取 `less` 方案，并内置了部分变量，以及常用混合方法，使得可以轻松开启样式编写、复用、修改等；
- [x] **封装了常用方法**；在 `helper/utils` 路径下，有对日期、字符串、系统等常用方法，分别进行封装，统一暴露给 `global.$utils`，使得维护方式更加合理且健壮，同时又可以便捷的使用，高效开发；当然，你也可以根据需要自行增删、抑或扩展；
- [x] **浏览器打开调试主页二维码**；运行 `npm run start`，会启动 HTTP 调试服务器，并将该地址在**命令行终端**显示，手机端用快应用调试器扫码，即可下载并运行 rpk 包；当终端积累的信息流多了，就造成扫码不便；故增设在浏览器打开调试主页二维码；如想不使用此功能，在 _command/server.js_ 文件中，将 **autoOpenBrowser** 设置为 `false` 即可；
- [x] **集成轻粒子统计分析**； [轻粒子](https://nicelinks.site/post/5bdfa8ba9fa22b1b40974f63) 作为官方推荐统计方案，此脚手架已做接入；使用时只需修改 [statistics.config.js](https://github.com/nicejade/quickapp-boilerplate-template/blob/master/src/assets/js/statistics.config.js) 中的 `app_key`，为在 [轻粒子](http://www.qinglizi.cn/) 所申请的快应用 KEY 即可；
- [x] **添加新增页面命令脚本**；使得可以一键生成新页面，只需运行: `npm run gen YourPageName` （命名推荐统一为大驼峰，将会在 `pages` 路径下新建该页面文件夹）命令即可，当然，也可以根据需要，自行定定制模板: */command/gen/template.ux*；
- [x] **集成 [Prettier](https://prettier.io/) & [Eslint](https://eslint.org/) **；在检测代码中潜在问题的同时，统一团队代码规范、风格（`js`，`less`，`scss`等），从而促使写出高质量代码，以提升工作效率(尤其针对团队开发)。
- [x] **编写 [prettier-plugin-quickapp](https://github.com/nicejade/prettier-plugin-quickapp) 插件**；为快应用编写 `prettier` 插件，使其可以针对 `.ux`/`.mix` 文件也能很好地工作，从而进一步完善代码风格及规范。
- [x] **新增文件监听命令**: 引入 [onchange](https://github.com/Qard/onchange) 依赖来监听文件变化；使得在开发时，运行 `npm run prettier-watch` 命令，即可对所修改的 `*.md` `*.ux` `*.js` 等文件，进行 **Prettier** 格式化，从而大幅度提升编写效率。

```javacript
    this.currentTime = new Date($utils.getCurrentTime()).Format()
    .finally(() => {
        $utils.showToast(`数据请求已完成`)
    })

    // template:
    // <!-- 创建快捷方式 -->
    // <input class="button" type="button" onclick="onShortcutClick" value="创建快捷方式" />
    // js:
    $utils.createShortcut()
```

## 参考

- [**倾城之链**](https://nicelinks.site?from=github)
- [倾城之链博客](https://jeffjade.com/nicelinks)
- [知乎](https://www.zhihu.com/people/yang-qiong-pu/)
- [简书](https://www.jianshu.com/u/9aae3d8f4c3d)
- [SegmentFault](https://segmentfault.com/u/jeffjade)
- [Twitter](https://twitter.com/nicejadeyang)
- [Facebook](https://www.facebook.com/nice.jade.yang)

