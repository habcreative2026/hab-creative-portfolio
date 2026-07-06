// const { contextBridge, ipcRenderer } = require("electron");

// contextBridge.exposeInMainWorld("electronAPI", {
//   getDeviceId: () => ipcRenderer.invoke("get-device-id"),
// });

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  getDeviceId: () => ipcRenderer.invoke("get-device-id"),
  // ⭐ Hàm ready cho loading mở app
  ready: () => ipcRenderer.send("loading-ready"),
});
