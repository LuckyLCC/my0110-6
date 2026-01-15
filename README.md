# 城市森林氧舱 uni-app 小程序

## 项目启动

### 方式一：使用 HBuilderX（推荐）

1. 下载并安装 [HBuilderX](https://www.dcloud.io/hbuilderx.html)
2. 打开 HBuilderX，选择 **文件 → 打开目录**，选择本项目目录
3. 点击顶部菜单 **运行 → 运行到浏览器** → 选择浏览器（Chrome/Safari/Firefox）
4. 浏览器会自动打开并显示页面

### 方式二：使用命令行

#### 1. 安装依赖

```bash
npm install
```

#### 2. 启动 H5 开发服务器

```bash
npm run dev:h5
```

或者使用 vite 直接启动：

```bash
npx vite
```

#### 3. 访问页面

浏览器会自动打开 `http://localhost:3000`，如果没有自动打开，手动访问该地址。

## 项目结构

```
├── pages/          # 页面目录
│   ├── index/      # 首页
│   ├── store/      # 会员商城
│   ├── booking/    # 预约页面
│   └── my/         # 我的页面
├── components/     # 组件目录
│   └── BottomNav.vue  # 底部导航组件
├── static/         # 静态资源目录
├── App.vue         # 应用入口
├── main.js         # 主入口文件
├── pages.json      # 页面配置
└── manifest.json   # 应用配置
```

## 页面说明

- **首页** (`pages/index/index.vue`) - 包含 hero banner、会员推荐、服务体验、环境画廊
- **会员商城** (`pages/store/store.vue`) - 会员套餐列表和购买
- **预约页面** (`pages/booking/booking.vue`) - 日期、时段、舱位选择
- **我的页面** (`pages/my/my.vue`) - 用户信息、会员状态、订单列表

## 注意事项

1. 图片资源：部分图片使用 Figma 临时 URL（7天有效），建议下载到 `static` 目录
2. 底部导航图标已配置为使用本地图片（`static/` 目录）
3. 确保所有页面的路径配置正确（`pages.json`）

## 开发工具

- HBuilderX（推荐）
- VS Code + uni-app 插件
- WebStorm

## 技术支持

如有问题，请查看 [uni-app 官方文档](https://uniapp.dcloud.net.cn/)


