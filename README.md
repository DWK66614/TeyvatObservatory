# 提瓦特观测台

一个用于查询原神玩家数据的工具，支持Android平台。

## 功能特点

- **玩家数据查询**：通过UID查询原神玩家公开信息
- **角色展示**：查看玩家展示的角色装备、属性、天赋等级
- **深境螺旋**：显示螺旋深渊层数和星数统计
- **数据面板**：角色属性统计和双暴评分
- **主题切换**：支持浅色/深色主题一键切换
- **响应式布局**：适配不同屏幕尺寸

## 技术栈

- **前端框架**：React 18 + Vite
- **UI框架**：Tailwind CSS
- **移动端**：Capacitor (Android)
- **桌面端**：Electron
- **数据源**：Enka.Network API

## 安装与运行

### 开发环境

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 构建Android应用

```bash
# 构建Web资源
npm run build

# 同步到Android项目
npx cap sync android

# 打开Android Studio
npx cap open android
```

### 构建Electron应用

```bash
# 安装Electron依赖
npm install

# 启动Electron
npm run electron:dev
```

## 项目结构

```
├── src/
│   ├── api/          # API接口封装
│   ├── components/   # React组件
│   ├── data/         # 静态数据文件
│   ├── utils/        # 工具函数
│   ├── App.jsx       # 主应用组件
│   └── main.jsx      # 入口文件
├── android/          # Android原生项目
├── electron/         # Electron桌面端
├── public/           # 静态资源
└── scripts/          # 构建脚本
```

## 使用说明

1. 打开应用，在搜索框中输入原神UID
2. 点击查询按钮获取玩家数据
3. 查看角色展示、深渊进度等信息
4. 使用主题切换按钮切换浅色/深色主题

## 注意事项

- 需要玩家开启"角色展示"功能才能查询
- 数据来源于Enka.Network
- 仅供学习交流使用

## 许可证

MIT License
