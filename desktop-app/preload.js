const { contextBridge, ipcRenderer } = require("electron");

console.log("[Preload] Loaded");

contextBridge.exposeInMainWorld("electronAPI", {
  // ===================== CLIPBOARD =====================
  copyToClipboard: (text) => ipcRenderer.invoke("copy-to-clipboard", text),
  readFromClipboard: () => ipcRenderer.invoke("read-from-clipboard"),

  // ===================== LOADING =====================
  onUpdateLoading: (callback) => {
    ipcRenderer.on("update-loading", (event, type) => callback(type));
  },
  updateLoading: (type) => ipcRenderer.send("update-loading", type),
  ready: () => ipcRenderer.send("loading-ready"),
  closeLoginLoading: () => ipcRenderer.send("close-login-loading"),

  // ===================== WINDOW CONTROLS =====================
  minimizeWindow: () => ipcRenderer.send("minimize-window"),
  maximizeWindow: () => ipcRenderer.send("maximize-window"),
  quitApp: () => ipcRenderer.send("quit-app"),

  // ===================== FACE ID API =====================
  faceAuth: {
    // ===== Save =====
    // 🆕 Hỗ trợ cả 2 dạng:
    //   saveDescriptor(descriptorArray)  → legacy, mặc định noMask
    //   saveDescriptor({ faceType, descriptor })  → mới
    saveDescriptor: (payload) =>
      ipcRenderer.invoke("face:save-descriptor", payload),

    // ===== Load =====
    // 🆕 Trả về { success, profiles: {noMask: [...], withMask: [...]}, types: [...] }
    loadDescriptor: () => ipcRenderer.invoke("face:load-descriptor"),

    // ===== Check =====
    hasDescriptor: () => ipcRenderer.invoke("face:has-descriptor"),
    hasType: (faceType) => ipcRenderer.invoke("face:has-type", faceType),
    listTypes: () => ipcRenderer.invoke("face:list-types"),
    getTypesInfo: () => ipcRenderer.invoke("face:get-types-info"),

    // ===== Delete =====
    deleteDescriptor: () => ipcRenderer.invoke("face:delete-descriptor"),
    deleteType: (faceType) => ipcRenderer.invoke("face:delete-type", faceType),

    // ===== Metadata =====
    getMetadata: () => ipcRenderer.invoke("face:get-metadata"),

    // ===== Callbacks =====
    onRegistrationComplete: (callback) => {
      ipcRenderer.on("face:registration-complete", () => callback());
    },
    onUnlockSuccess: (callback) => {
      ipcRenderer.on("face:unlock-success", () => callback());
    },

    // ===== Window control =====
    closeFaceWindow: () => ipcRenderer.send("face:close-window"),

    unlockSuccess: () => {
      console.log("[Preload] faceAuth.unlockSuccess called");
      ipcRenderer.send("face:unlock-success-ack");
    },

    fallbackToLogin: () => {
      console.log("[Preload] faceAuth.fallbackToLogin called");
      ipcRenderer.send("face:fallback-login");
    },

    getAttempts: () => ipcRenderer.invoke("face:get-attempts"),
    resetAttempts: () => ipcRenderer.invoke("face:reset-attempts"),
  },
});
