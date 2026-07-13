# 提瓦特观测台 · Teyvat Observatory

> 基于 Electron + React 的原神玩家信息查询工具，输入 UID 即可查看账号数据。

---

## 📁 项目结构

```
genshin-impact-tracker/
│
├── 📄 index.html              # HTML 入口，加载 React 应用、Google Fonts
├── 📄 package.json            # 项目配置：依赖声明、Electron 打包参数 (NSIS 安装包)
├── 📄 vite.config.js          # Vite 构建配置：端口、路径别名、Enka API 代理
├── 📄 tailwind.config.js      # Tailwind CSS 配置：自定义颜色/字体/动画
├── 📄 postcss.config.js       # PostCSS 配置 (Tailwind + Autoprefixer)
├── 📄 icon.ico                # 软件图标，打包安装包时使用
│
├── 📁 electron/               # Electron 桌面壳
│   ├── main.cjs               # 主进程：创建窗口、加载页面、禁用菜单栏
│   └── preload.cjs            # 预加载脚本：安全地向渲染进程暴露 API
│
├── 📁 public/
│   └── favicon.png            # 网页标签图标 (32×32)
│
└── 📁 src/                    # React 前端源码
    ├── main.jsx               # React 入口：挂载 App 到 DOM
    ├── App.jsx                # 根组件：标签页路由 (概览/角色/深渊/面板)
    ├── index.css              # 全局样式：Tailwind 指令 + 自定义 CSS 变量
    │
    ├── 📁 api/                # 数据请求层
    │   └── enka.js            # Enka.Network API 封装：玩家数据/角色展柜/图片映射
    │
    ├── 📁 data/               # 静态数据 (由 genshin-db 预生成)
    │   ├── characters.json    # 角色 ID → 名称/元素/武器/星级
    │   ├── char-images.json   # 角色 ID → 立绘图片 URL
    │   ├── pfps.json          # 头像 ID → 头像图标路径
    │   └── internal-names.json# 内部名称 → 中文名称映射
    │
    ├── 📁 utils/
    │   └── constants.js       # 常量定义：七元素颜色/图标映射
    │
    └── 📁 components/         # UI 组件
        ├── WelcomeScreen.jsx       # 欢迎页：输入 UID 查询
        ├── PlayerOverview.jsx      # 玩家概览：基础信息 / 统计 / 深渊进度
        ├── CharacterShowcase.jsx   # 角色展柜：角色列表 / 筛选 / 详情
        ├── CharacterCard.jsx       # 角色卡片：头像 / 等级 / 属性 / 圣遗物
        ├── Sidebar.jsx             # 侧边栏：UID 输入 / 最近查询记录
        ├── SpiralAbyss.jsx         # 深境螺旋：层数 / 成就 / 角色统计
        ├── ImaginariumTheater.jsx  # 幻想真境剧诗：战绩 / 通关时间
        ├── StatsPanel.jsx          # 数据面板：角色属性 / 双暴评分 (CV)
        ├── LoadingSpinner.jsx      # 加载动画：数据请求中的等待效果
        └── StarBackground.jsx      # 星空背景：粒子动画背景
```

---

## 🚀 开发

```bash
# 安装依赖
npm install

# 浏览器开发 (仅前端)
npm run dev

# Electron 桌面开发
npm run electron:dev

# 打包为 Windows 安装包 (.exe)
npm run electron:build:win
```

输出在 `release/` 目录下，双击 `TeyvatObservatory Setup x.x.x.exe` 即可安装。

## 🛠 技术栈

| 层 | 技术 |
|----|------|
| 桌面框架 | Electron 43 |
| 前端框架 | React 18 + Vite 5 |
| UI | Tailwind CSS + Framer Motion + Lucide Icons |
| 数据 | Enka.Network API + genshin-db |
| 打包 | electron-builder (NSIS 安装向导) |

## 📄 License

MIT
