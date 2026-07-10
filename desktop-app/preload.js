const { contextBridge, ipcRenderer } = require("electron");

console.log("Preload loaded");

contextBridge.exposeInMainWorld("electronAPI", {
  getDeviceId: () => ipcRenderer.invoke("get-device-id"),
  checkDevice: (deviceId) => ipcRenderer.invoke("check-device", deviceId),
  checkDeviceStatus: () => ipcRenderer.invoke("check-device-status"),
  ready: () => ipcRenderer.send("loading-ready"),
  openExternal: (url) => ipcRenderer.send("open-external", url),
  quitApp: () => ipcRenderer.send("quit-app"),
  deviceVerified: () => ipcRenderer.send("device-verified"),

  copyToClipboard: (text) => {
    console.log("[Preload] copyToClipboard called:", text);
    return ipcRenderer.invoke("copy-to-clipboard", text);
  },

  readFromClipboard: () => {
    console.log("[Preload] readFromClipboard called");
    return ipcRenderer.invoke("read-from-clipboard");
  },
});
