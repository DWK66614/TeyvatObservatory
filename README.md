# 提瓦特观测台 · Teyvat Observatory

> 原神玩家数据查询工具，支持 UID 查询、祈愿记录分析、多账号管理。
>
> Genshin Impact player data query tool with UID lookup, wish history analysis, and multi-account support.

---

## ✨ 功能特性

### UID 查询
- 输入 UID 查询角色展柜、深境螺旋、幻想真境剧诗战绩
- 角色面板评分、暴击值(CV)评级
- 基于 [Enka.Network](https://enka.network) API

### 祈愿记录分析
- 米游社扫码登录，获取祈愿记录
- 全卡池记录拉取（新手/常驻/角色/武器/集录）
- 五星出货记录、抽数统计、保底计数
- 加密存储，保护隐私

### 多账号支持
- 多账号登录管理
- 账号切换
- 本地加密存储祈愿数据

---

## 📁 项目结构

```
Teyvat-Observatory/
│
├── index.html                    # 入口页面
├── package.json                  # 依赖声明 + 打包配置
├── vite.config.js                # Vite 构建配置
├── tailwind.config.js            # Tailwind 主题配置
├── postcss.config.js             # PostCSS 配置
├── installer.iss                 # Inno Setup 安装包脚本
├── icon.ico                      # 应用图标
│
├── electron/                     # Electron 主进程
│   ├── main.cjs                  # 主进程：创建窗口、IPC通信
│   ├── preload.cjs               # 预加载：暴露安全API
│   └── mihoyo.cjs                # 米游社API：扫码登录、祈愿获取
│
├── public/
│   └── favicon.svg               # 网页图标
│
├── src/                          # React 前端源码
│   ├── main.jsx                  # React 入口
│   ├── App.jsx                   # 根组件：路由、状态管理
│   ├── index.css                 # 全局样式
│   │
│   ├── api/                      # 数据请求层
│   │   ├── enka.js               # Enka.Network API 封装
│   │   └── mihoyo.js             # 米游社API渲染端封装（IPC调用）
│   │
│   ├── data/                     # 静态数据
│   │   ├── characters.json       # 角色ID映射
│   │   ├── char-images.json      # 角色立绘图片
│   │   ├── gacha-icons.json      # 祈愿物品图标映射
│   │   ├── pfps.json             # 头像映射
│   │   └── internal-names.json   # 内部名称映射
│   │
│   ├── utils/
│   │   ├── constants.js          # 七元素常量定义
│   │   └── theme.jsx             # 主题系统（深色/浅色）
│   │
│   └── components/               # UI 组件
│       ├── WelcomeScreen.jsx     # UID 查询页面 + 历史记录
│       ├── HomeScreen.jsx        # 首页双卡片（UID + 祈愿）
│       ├── Header.jsx            # 顶部导航栏
│       ├── HeroBanner.jsx        # 玩家信息横幅
│       ├── PlayerOverview.jsx    # 玩家概览
│       ├── CharacterShowcase.jsx # 角色展柜
│       ├── CharacterCard.jsx     # 角色卡片
│       ├── SpiralAbyss.jsx       # 深境螺旋
│       ├── ImaginariumTheater.jsx # 幻想真境剧诗
│       ├── StatsPanel.jsx        # 数据面板
│       ├── QrLoginModal.jsx      # 米游社扫码登录弹窗
│       ├── GachaReport.jsx       # 祈愿记录分析报告
│       ├── LoadingSpinner.jsx    # 加载动画
│       └── StarBackground.jsx    # 星空背景
│
└── docs/
    └── gacha-feature.md          # 祈愿功能设计文档
```

---

## 🚀 开发

```bash
# 安装依赖
npm install

# 浏览器开发
npm run dev

# Electron 桌面开发
npm run electron:dev

# 打包 Windows 安装包
npm run electron:build:win

# 使用 Inno Setup 打包（推荐）
# 先运行 npm run electron:build:win，然后用 Inno Setup 编译 installer.iss
```

输出在 `releases/` 目录，双击 `Teyvat Observatory Setup x.x.x.exe` 安装。

---

## 🛠 技术栈

| 层级 | 技术 |
|------|------|
| 桌面 | Electron 43 |
| 前端 | React 18 + Vite 5 |
| UI | Tailwind CSS + Lucide Icons |
| 数据 | Enka.Network API + 米游社API |
| 加密 | Web Crypto API (AES-256-GCM) |
| 打包 | electron-builder + Inno Setup |

---

## 📝 说明

- **数据来源**：UID 查询数据来自 [Enka.Network](https://enka.network)，祈愿记录来自米游社官方接口
- **隐私保护**：祈愿数据使用 AES-256-GCM 加密存储在本地
- **仅供学习**：本工具仅供学习交流使用

---

## 📄 License

MIT
