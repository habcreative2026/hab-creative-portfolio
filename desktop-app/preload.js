const { contextBridge, ipcRenderer } = require("electron");

console.log("Preload loaded");

contextBridge.exposeInMainWorld("electronAPI", {
  copyToClipboard: (text) => {
    console.log("[Preload] copyToClipboard called:", text);
    return ipcRenderer.invoke("copy-to-clipboard", text);
  },

  readFromClipboard: () => {
    console.log("[Preload] readFromClipboard called");
    return ipcRenderer.invoke("read-from-clipboard");
  },

  // 👉 LẮNG NGHE SỰ KIỆN UPDATE TỪ MAIN
  onUpdateLoading: (callback) => {
    ipcRenderer.on("update-loading", (event, type) => callback(type));
  },

  // 👉 GỬI UPDATE LÊN MAIN
  updateLoading: (type) => {
    console.log(`[Preload] updateLoading called with type: ${type}`);
    ipcRenderer.send("update-loading", type);
  },

  // 👉 GỬI TÍN HIỆU READY (KHỞI TẠO MAIN WINDOW)
  ready: () => {
    console.log("[Preload] Ready called, sending loading-ready");
    ipcRenderer.send("loading-ready");
  },

  // 👉 ĐÓNG LOADING LOGIN (THÊM MỚI)
  closeLoginLoading: () => {
    console.log("[Preload] closeLoginLoading called");
    ipcRenderer.send("close-login-loading");
  },

  minimizeWindow: () => {
    console.log("[Preload] minimizeWindow called");
    ipcRenderer.send("minimize-window");
  },

  maximizeWindow: () => {
    console.log("[Preload] maximizeWindow called");
    ipcRenderer.send("maximize-window");
  },

  quitApp: () => {
    console.log("[Preload] quitApp called");
    ipcRenderer.send("quit-app");
  },
});
