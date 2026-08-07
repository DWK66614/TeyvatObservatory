const { contextBridge, ipcRenderer } = require('electron')

// Expose a minimal API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,

  mihoyo: {
    createQR: () => ipcRenderer.invoke('mihoyo:createQR'),
    queryQR: (ticket) => ipcRenderer.invoke('mihoyo:queryQR', ticket),
    completeLogin: (cookie) => ipcRenderer.invoke('mihoyo:completeLogin', cookie),
    gameRoles: (cookie) => ipcRenderer.invoke('mihoyo:gameRoles', cookie),
    genAuthKey: (cookie, account) => ipcRenderer.invoke('mihoyo:genAuthKey', cookie, account),
    fetchGacha: (authkey) => ipcRenderer.invoke('mihoyo:fetchGacha', authkey),
    devCookie: () => ipcRenderer.invoke('mihoyo:devCookie'),
    onGachaProgress: (cb) => {
      ipcRenderer.on('mihoyo:gachaProgress', (_e, data) => cb(data))
    },
  },
})
