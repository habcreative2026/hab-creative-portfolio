const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  copyToClipboard: (text) => ipcRenderer.invoke("copy-to-clipboard", text),
  readFromClipboard: () => ipcRenderer.invoke("read-from-clipboard"),

  minimizeWindow: () => ipcRenderer.send("minimize-window"),
  maximizeWindow: () => ipcRenderer.send("maximize-window"),
  quitApp: () => ipcRenderer.send("quit-app"),

  getModelsPath: () => ipcRenderer.invoke("get-models-path"),
  getLibsPath: () => ipcRenderer.invoke("get-libs-path"),

  faceAuth: {
    hasAny: () => ipcRenderer.invoke("face:has-any"),
    count: () => ipcRenderer.invoke("face:count"),
    max: () => ipcRenderer.invoke("face:max"),
    isFull: () => ipcRenderer.invoke("face:is-full"),
    getList: () => ipcRenderer.invoke("face:get-list"),
    save: (payload) => ipcRenderer.invoke("face:save", payload),
    loadAll: () => ipcRenderer.invoke("face:load-all"),
    deleteAll: () => ipcRenderer.invoke("face:delete-all"),
    deleteOne: (index) => ipcRenderer.invoke("face:delete-one", index),
    closeFaceWindow: () => ipcRenderer.send("face:close-window"),
    unlockSuccess: () => ipcRenderer.send("face:unlock-success-ack"),
    fallbackToLogin: () => ipcRenderer.send("face:fallback-login"),
  },
});
