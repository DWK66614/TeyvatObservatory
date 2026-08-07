const { app, BrowserWindow, Menu, ipcMain } = require('electron')
const path = require('path')
const os = require('os')
const fs = require('fs')
const mihoyo = require('./mihoyo.cjs')

const isDev = process.env.ELECTRON_DEV === 'true' || process.env.NODE_ENV === 'development'

let mainWindow = null

function registerIpc() {
  // 创建登录二维码
  ipcMain.handle('mihoyo:createQR', () => mihoyo.createQRLogin())

  // 轮询二维码状态
  ipcMain.handle('mihoyo:queryQR', (_e, ticket) => mihoyo.queryQRLoginStatus(ticket))

  // 登录成功后补齐 cookie_token/ltoken
  ipcMain.handle('mihoyo:completeLogin', (_e, cookie) => mihoyo.completeLogin(cookie))

  // 获取游戏角色列表
  ipcMain.handle('mihoyo:gameRoles', (_e, cookie) => mihoyo.getUserGameRolesByCookie(cookie))

  // 生成 authkey
  ipcMain.handle('mihoyo:genAuthKey', (_e, cookie, account) => mihoyo.genAuthKey(cookie, account))

  // 拉取全部祈愿记录
  ipcMain.handle('mihoyo:fetchGacha', async (_e, authkey, onProgress) => {
    const progress = (type, page, count, total) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('mihoyo:gachaProgress', { type, page, count, total })
      }
    }
    return mihoyo.fetchAllGacha(authkey, progress)
  })

  // 读取 CLI 测试保存的登录会话(开发便利, 正式发布可移除)
  ipcMain.handle('mihoyo:devCookie', () => {
    try {
      const p = path.join(os.tmpdir(), 'mihoyo-cookie.json')
      if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf8'))
    } catch { /* ignore */ }
    return null
  })
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'Teyvat Observatory',
    backgroundColor: '#080C16',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: false,
  })

  // Remove default menu
  Menu.setApplicationMenu(null)

  // Load content
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000')
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // Show window when ready to avoid flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  mihoyo.setApp(app)
  registerIpc()
  createWindow()
})

app.on('window-all-closed', () => {
  app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
