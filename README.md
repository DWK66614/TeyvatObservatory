# Teyvat Observatory · 提瓦特观测台

> Genshin Impact player data query tool built with Electron + React. Enter a UID to look up account data.
>
> 基于 Electron + React 的原神玩家数据查询工具，输入 UID 即可查询账号信息。

---

## 📁 Project Structure / 项目结构

```
genshin-impact-tracker/
│
├── 📄 index.html              # HTML entry, loads React app + Google Fonts / 入口页面
├── 📄 package.json            # Dependencies + Electron-builder NSIS config / 依赖声明 + 打包配置
├── 📄 vite.config.js          # Vite config: proxy Enka API / 构建配置 + API 代理
├── 📄 tailwind.config.js      # Custom colors, fonts, animations / 自定义主题
├── 📄 postcss.config.js       # PostCSS (Tailwind + Autoprefixer)
├── 📄 icon.ico                # App icon for installer / 软件图标
│
├── 📁 electron/               # Electron desktop shell / 桌面壳
│   ├── main.cjs               # Main process: create window, hide menu / 主进程
│   └── preload.cjs            # Preload: expose safe API to renderer / 预加载
│
├── 📁 public/
│   └── favicon.png            # Tab icon / 网页图标 (32×32)
│
└── 📁 src/                    # React source / 前端源码
    ├── main.jsx               # React mount point / 入口
    ├── App.jsx                # Root: tab routing / 根组件 (概览/角色/深渊/面板)
    ├── index.css              # Global styles + Tailwind directives / 全局样式
    │
    ├── 📁 api/                # Data layer / 数据请求
    │   └── enka.js            # Enka.Network API wrapper / 接口封装
    │
    ├── 📁 data/               # Pre-generated from genshin-db / 静态数据
    │   ├── characters.json    # Character ID → name/element/weapon/rarity / 角色映射
    │   ├── char-images.json   # Character ID → splash art URL / 立绘图片
    │   ├── pfps.json          # Avatar ID → icon path / 头像映射
    │   └── internal-names.json# Internal name → display name / 内部名称映射
    │
    ├── 📁 utils/
    │   └── constants.js       # Element colors + icon definitions / 七元素常量
    │
    └── 📁 components/         # UI Components / 界面组件
        ├── WelcomeScreen.jsx       # Enter UID to query / 输入 UID 查询
        ├── PlayerOverview.jsx      # Player info + stats + abyss preview / 玩家概览
        ├── CharacterShowcase.jsx   # Character list + filter + detail / 角色展柜
        ├── CharacterCard.jsx       # Avatar, level, stats, artifacts / 角色卡片
        ├── Sidebar.jsx             # UID input + recent history / 侧边栏
        ├── SpiralAbyss.jsx         # Floor progress, achievements / 深境螺旋
        ├── ImaginariumTheater.jsx  # Battle records, clear times / 幻想真境剧诗
        ├── StatsPanel.jsx          # Attributes + Crit Value (CV) grading / 数据面板
        ├── LoadingSpinner.jsx      # Loading animation / 加载动画
        └── StarBackground.jsx      # Particle starfield background / 星空背景
```

---

## 🚀 Development / 开发

```bash
# Install / 安装依赖
npm install

# Browser only (frontend) / 浏览器开发
npm run dev

# Electron desktop / 桌面开发
npm run electron:dev

# Build Windows installer / 打包安装包
npm run electron:build:win
```

Output at `release/`, double-click `Teyvat Observatory Setup x.x.x.exe` to install.
输出在 `release/` 目录，双击安装包即可安装。

## 🛠 Tech Stack / 技术栈

| Layer | Tech |
|-------|------|
| Desktop / 桌面 | Electron 43 |
| Frontend / 前端 | React 18 + Vite 5 |
| UI | Tailwind CSS + Framer Motion + Lucide Icons |
| Data / 数据 | Enka.Network API + genshin-db |
| Packager / 打包 | electron-builder (NSIS) |

## 📄 License

MIT

##Developed by Rain, ClaudeCode, and Deepseek-v4-pro
