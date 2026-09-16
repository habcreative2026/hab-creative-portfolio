const {
  app,
  BrowserWindow,
  Menu,
  ipcMain,
  shell,
  session,
  clipboard,
  safeStorage,
  dialog,
} = require("electron");
const path = require("path");
const fs = require("fs");

// ===================== FLAGS =====================
const FACE_TEST_MODE = false;

let mainWindow = null;
let loadingWindow = null;
let faceTestWindow = null;
let faceRegisterWindow = null;
let faceUnlockWindow = null;
let isMainReady = false;

let hasRedirectedToDashboard = false;
let faceUnlockAttempts = 0;
const MAX_UNLOCK_ATTEMPTS = 3;

let isUnlockingInProgress = false;
let isTransitioningToMain = false;

// Đường dẫn file
const FACE_PROFILES_PATH = path.join(
  app.getPath("userData"),
  "face-profiles.enc",
);
const FACE_METADATA_PATH = path.join(app.getPath("userData"), "face-meta.json");
const DASHBOARD_URL = "http://localhost:3000/admin/dashboard";
const LOGIN_URL = "http://localhost:3000/admin/login";

// 🆕 Các loại face profile (3 types)
const FACE_TYPES = {
  noMask: { id: "noMask", label: "Không khẩu trang", emoji: "😊" },
  withMask: { id: "withMask", label: "Có khẩu trang", emoji: "😷" },
  withGlasses: { id: "withGlasses", label: "Đeo kính", emoji: "👓" },
};

app.commandLine.appendSwitch("enable-gpu-rasterization");
app.commandLine.appendSwitch("enable-zero-copy");
app.commandLine.appendSwitch("enable-oop-rasterization");
app.commandLine.appendSwitch("disable-software-rasterizer");
app.commandLine.appendSwitch("js-flags", "--max-old-space-size=512");
app.commandLine.appendSwitch("disable-renderer-backgrounding");

app.commandLine.appendSwitch("ignore-gpu-blacklist");
app.commandLine.appendSwitch("enable-accelerated-2d-canvas");

// ===================== FACE ID HELPERS =====================
function hasAnyFaceRegistered() {
  return fs.existsSync(FACE_PROFILES_PATH);
}

function getRegisteredFaceTypes() {
  try {
    if (!fs.existsSync(FACE_METADATA_PATH)) return [];
    const meta = JSON.parse(fs.readFileSync(FACE_METADATA_PATH, "utf-8"));
    return Object.keys(meta.profiles || {}).filter(
      (key) => meta.profiles[key]?.registeredAt,
    );
  } catch (err) {
    console.error("[Face] Get registered types error:", err);
    return [];
  }
}

function loadFaceMetadata() {
  try {
    if (!fs.existsSync(FACE_METADATA_PATH)) {
      return { profiles: {}, version: "2.0.0" };
    }
    return JSON.parse(fs.readFileSync(FACE_METADATA_PATH, "utf-8"));
  } catch (err) {
    console.error("[Face] Load metadata error:", err);
    return { profiles: {}, version: "2.0.0" };
  }
}

function saveFaceMetadata(metadata) {
  try {
    fs.writeFileSync(FACE_METADATA_PATH, JSON.stringify(metadata, null, 2));
    return true;
  } catch (err) {
    console.error("[Face] Save metadata error:", err);
    return false;
  }
}

function loadAllFaceProfiles() {
  try {
    if (!fs.existsSync(FACE_PROFILES_PATH)) return null;
    if (!safeStorage.isEncryptionAvailable()) {
      throw new Error("Mã hóa hệ thống không khả dụng");
    }
    const encrypted = fs.readFileSync(FACE_PROFILES_PATH);
    const decrypted = safeStorage.decryptString(encrypted);
    return JSON.parse(decrypted);
  } catch (err) {
    console.error("[Face] Load profiles error:", err);
    return null;
  }
}

function saveAllFaceProfiles(profiles) {
  try {
    if (!safeStorage.isEncryptionAvailable()) {
      throw new Error("Mã hóa hệ thống không khả dụng");
    }
    const jsonStr = JSON.stringify(profiles);
    const encrypted = safeStorage.encryptString(jsonStr);
    fs.writeFileSync(FACE_PROFILES_PATH, encrypted);
    return true;
  } catch (err) {
    console.error("[Face] Save profiles error:", err);
    return false;
  }
}

// ===================== LOADING WINDOW =====================
function createLoadingWindow(type = "init") {
  if (loadingWindow && !loadingWindow.isDestroyed()) {
    loadingWindow.webContents.send("update-loading", type);
    loadingWindow.show();
    return loadingWindow;
  }

  loadingWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    frame: false,
    transparent: false,
    resizable: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
    icon: path.join(__dirname, "assets", "icon.png"),
    title: "HAB CREATIVE",
    backgroundColor: "#0a0a0f",
    show: true,
  });

  loadingWindow.loadFile(path.join(__dirname, "loading.html"), {
    query: { type: type },
  });

  loadingWindow.on("closed", () => {
    loadingWindow = null;
  });

  return loadingWindow;
}

function hideLoading() {
  if (loadingWindow && !loadingWindow.isDestroyed()) {
    loadingWindow.close();
    loadingWindow = null;
  }
}

// ===================== FACE UNLOCK WINDOW =====================
function createFaceUnlockWindow() {
  console.log("[Face Unlock] Creating unlock window");

  faceUnlockAttempts = 0;
  isUnlockingInProgress = false;
  isTransitioningToMain = false;

  faceUnlockWindow = new BrowserWindow({
    width: 550,
    height: 720,
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
      webSecurity: false,
    },
    title: "Mở khóa HAB CREATIVE",
    backgroundColor: "#0a0a0f",
    show: true,
  });

  faceUnlockWindow.loadFile("face-unlock.html");

  faceUnlockWindow.webContents.session.setPermissionRequestHandler(
    (webContents, permission, callback) => {
      if (permission === "media") callback(true);
      else callback(false);
    },
  );

  faceUnlockWindow.on("closed", () => {
    console.log("[Face Unlock] Window closed");
    faceUnlockWindow = null;

    if (isUnlockingInProgress || isTransitioningToMain) {
      console.log("[Face Unlock] Unlock in progress, skipping quit");
      return;
    }

    if (!mainWindow && !isMainReady) {
      console.log("[Face Unlock] Closed without unlocking → quitting app");
      app.quit();
    }
  });
}

// ===================== MAIN WINDOW =====================
async function createMainWindow(options = {}) {
  const { fromUnlock = false } = options;
  const mainSession = session.fromPartition("persist:main");

  let isLoggedIn = false;
  try {
    const cookies = await mainSession.cookies.get({ name: "auth_token" });
    isLoggedIn = cookies.length > 0 && !!cookies[0].value;
    console.log("[Main] Auth cookie found:", isLoggedIn);
  } catch (err) {
    console.error("[Main] Cookie check error:", err);
  }

  if (isLoggedIn) hasRedirectedToDashboard = true;

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
      session: mainSession,
      spellcheck: false,
      plugins: false,
      webgl: true,
      enableWebSQL: false,
      v8CacheOptions: "code",
      webSecurity: false,
      allowRunningInsecureContent: true,
    },
    icon: path.join(__dirname, "assets", "icon.png"),
    title: "HAB CREATIVE",
    backgroundColor: "#f3f4f6",
    show: false,
  });

  let targetUrl;
  if (fromUnlock && isLoggedIn) {
    targetUrl = DASHBOARD_URL;
    console.log("[Main] Unlocked + has cookie → dashboard");
  } else if (isLoggedIn) {
    targetUrl = DASHBOARD_URL;
    console.log("[Main] Has cookie → dashboard");
  } else {
    targetUrl = LOGIN_URL;
    console.log("[Main] No cookie → login");
  }

  mainWindow.loadURL(targetUrl, {
    extraHeaders: "x-desktop-app: true\n",
  });

  let loginStarted = false;

  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (url.includes("accounts.google.com") || url.includes("google.com")) {
      if (!loginStarted) {
        loginStarted = true;
        createLoadingWindow("login");
      }
    }
  });

  mainWindow.webContents.on("did-finish-load", () => {
    console.log("[Main] ✅ Finished loading");
    hideLoading();
    loginStarted = false;
    mainWindow.show();
    mainWindow.focus();
    isMainReady = true;
    isTransitioningToMain = false;
    console.log("[Main] isTransitioningToMain reset to false");
  });

  mainWindow.webContents.on("did-fail-load", () => {
    hideLoading();
    loginStarted = false;
    if (mainWindow) mainWindow.show();
    isTransitioningToMain = false;
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.includes("accounts.google.com") || url.includes("google.com")) {
      return { action: "allow" };
    }
    shell.openExternal(url);
    return { action: "deny" };
  });

  setupCookieListener();

  mainWindow.on("closed", () => {
    mainWindow = null;
    isMainReady = false;
    hasRedirectedToDashboard = false;
    isUnlockingInProgress = false;
    isTransitioningToMain = false;
  });
}

// ===================== COOKIE LISTENER =====================
function setupCookieListener() {
  if (!mainWindow || mainWindow.isDestroyed()) return;

  const mainSession = session.fromPartition("persist:main");

  mainSession.cookies.on("changed", (event, cookie, cause, removed) => {
    if (cookie.name === "auth_token") {
      console.log(
        `[Cookie] auth_token | cause=${cause} | removed=${removed} | hasRedirected=${hasRedirectedToDashboard}`,
      );
    }

    if (
      cookie.name === "auth_token" &&
      !removed &&
      cause === "explicit" &&
      !hasRedirectedToDashboard
    ) {
      console.log("[Main] ✅ Login detected → redirecting to dashboard");
      hasRedirectedToDashboard = true;

      createLoadingWindow("login");

      setTimeout(() => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.loadURL(DASHBOARD_URL, {
            extraHeaders: "x-desktop-app: true\n",
          });
        }
      }, 500);
    }

    if (cookie.name === "auth_token" && removed) {
      hasRedirectedToDashboard = false;
    }
  });
}

// ===================== FACE REGISTER WINDOW =====================
function openFaceRegistration(faceType = null) {
  if (faceRegisterWindow && !faceRegisterWindow.isDestroyed()) {
    faceRegisterWindow.focus();
    return;
  }

  console.log("[Face] Opening registration window, type:", faceType);

  faceRegisterWindow = new BrowserWindow({
    width: 750,
    height: 800,
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
      webSecurity: false,
    },
    title: "Đăng ký Face ID",
    backgroundColor: "#0a0a0f",
    show: true,
  });

  if (faceType) {
    faceRegisterWindow.loadFile("face-register.html", {
      query: { type: faceType },
    });
  } else {
    faceRegisterWindow.loadFile("face-register.html");
  }

  faceRegisterWindow.webContents.session.setPermissionRequestHandler(
    (webContents, permission, callback) => {
      if (permission === "media") callback(true);
      else callback(false);
    },
  );

  faceRegisterWindow.on("closed", () => {
    faceRegisterWindow = null;
    createMenu();
  });
}

// ===================== DELETE FACE ID =====================
async function confirmDeleteFaceId() {
  const registered = getRegisteredFaceTypes();
  if (registered.length === 0) return;

  const labels = registered
    .map((t) => `  ${FACE_TYPES[t].emoji} ${FACE_TYPES[t].label}`)
    .join("\n");

  const result = await dialog.showMessageBox({
    type: "warning",
    title: "Xóa Face ID?",
    message: "Bạn có chắc muốn xóa TẤT CẢ Face ID?",
    detail: `Sẽ xóa:\n${labels}\n\nBạn cần đăng ký lại để sử dụng Face ID.`,
    buttons: ["Hủy", "Xóa tất cả"],
    defaultId: 0,
    cancelId: 0,
  });

  if (result.response === 1) {
    try {
      if (fs.existsSync(FACE_PROFILES_PATH)) fs.unlinkSync(FACE_PROFILES_PATH);
      if (fs.existsSync(FACE_METADATA_PATH)) fs.unlinkSync(FACE_METADATA_PATH);
      console.log("[Face] ✅ Deleted all profiles");

      await dialog.showMessageBox({
        type: "info",
        title: "Đã xóa",
        message: "Tất cả Face ID đã được xóa thành công.",
        buttons: ["OK"],
      });

      createMenu();
    } catch (err) {
      console.error("[Face] Delete error:", err);
      dialog.showErrorBox("Lỗi", "Không thể xóa Face ID: " + err.message);
    }
  }
}

async function confirmDeleteOneFace(faceType) {
  const meta = loadFaceMetadata();
  const profile = meta.profiles?.[faceType];
  if (!profile) return;

  const faceInfo = FACE_TYPES[faceType];

  const result = await dialog.showMessageBox({
    type: "warning",
    title: `Xóa ${faceInfo.label}?`,
    message: `Bạn có chắc muốn xóa Face ID "${faceInfo.label}"?`,
    detail: `Đăng ký ngày: ${new Date(profile.registeredAt).toLocaleString("vi-VN")}`,
    buttons: ["Hủy", "Xóa"],
    defaultId: 0,
    cancelId: 0,
  });

  if (result.response === 1) {
    try {
      const profiles = loadAllFaceProfiles() || {};
      delete profiles[faceType];
      saveAllFaceProfiles(profiles);

      const meta = loadFaceMetadata();
      delete meta.profiles[faceType];
      saveFaceMetadata(meta);

      if (Object.keys(profiles).length === 0) {
        if (fs.existsSync(FACE_PROFILES_PATH))
          fs.unlinkSync(FACE_PROFILES_PATH);
        if (fs.existsSync(FACE_METADATA_PATH))
          fs.unlinkSync(FACE_METADATA_PATH);
      }

      console.log(`[Face] ✅ Deleted profile: ${faceType}`);

      await dialog.showMessageBox({
        type: "info",
        title: "Đã xóa",
        message: `Face ID "${faceInfo.label}" đã được xóa.`,
        buttons: ["OK"],
      });

      createMenu();
    } catch (err) {
      console.error("[Face] Delete error:", err);
      dialog.showErrorBox("Lỗi", "Không thể xóa: " + err.message);
    }
  }
}

// ===================== FACE TEST WINDOW =====================
function createFaceTestWindow() {
  faceTestWindow = new BrowserWindow({
    width: 900,
    height: 700,
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
      webSecurity: false,
    },
    title: "Face ID Test",
    backgroundColor: "#0a0a0f",
  });

  faceTestWindow.loadFile("face-test.html");

  faceTestWindow.webContents.session.setPermissionRequestHandler(
    (webContents, permission, callback) => {
      if (permission === "media") callback(true);
      else callback(false);
    },
  );

  faceTestWindow.webContents.openDevTools({ mode: "right" });

  faceTestWindow.on("closed", () => {
    faceTestWindow = null;
  });
}

// ===================== MENU =====================
function createMenu() {
  const isMac = process.platform === "darwin";
  const registered = getRegisteredFaceTypes();
  const hasNoMask = registered.includes("noMask");
  const hasWithMask = registered.includes("withMask");
  const hasWithGlasses = registered.includes("withGlasses");
  const hasAny = registered.length > 0;

  // Build submenu cho Face ID
  const faceSubmenu = [
    {
      label: hasNoMask
        ? "📸 Đăng ký lại Không khẩu trang"
        : "📸 Đăng ký Không khẩu trang",
      accelerator: "CmdOrCtrl+Shift+1",
      click: () => openFaceRegistration("noMask"),
    },
    {
      label: hasWithMask
        ? "📸 Đăng ký lại Có khẩu trang"
        : "📸 Đăng ký Có khẩu trang",
      accelerator: "CmdOrCtrl+Shift+2",
      click: () => openFaceRegistration("withMask"),
    },
    {
      label: hasWithGlasses ? "📸 Đăng ký lại Đeo kính" : "📸 Đăng ký Đeo kính",
      accelerator: "CmdOrCtrl+Shift+3",
      click: () => openFaceRegistration("withGlasses"),
    },
    { type: "separator" },
  ];

  // Nếu đã đăng ký loại nào → thêm option xóa riêng
  if (hasNoMask) {
    faceSubmenu.push({
      label: "🗑️ Xóa Không khẩu trang",
      click: () => confirmDeleteOneFace("noMask"),
    });
  }
  if (hasWithMask) {
    faceSubmenu.push({
      label: "🗑️ Xóa Có khẩu trang",
      click: () => confirmDeleteOneFace("withMask"),
    });
  }
  if (hasWithGlasses) {
    faceSubmenu.push({
      label: "🗑️ Xóa Đeo kính",
      click: () => confirmDeleteOneFace("withGlasses"),
    });
  }

  if (hasAny) {
    faceSubmenu.push({ type: "separator" });
    faceSubmenu.push({
      label: "🗑️ Xóa tất cả Face ID",
      click: () => confirmDeleteFaceId(),
    });
  }

  // Trạng thái
  faceSubmenu.push({ type: "separator" });
  faceSubmenu.push({
    label: hasNoMask
      ? "✅ Không khẩu trang: Đã đăng ký"
      : "❌ Không khẩu trang: Chưa đăng ký",
    enabled: false,
  });
  faceSubmenu.push({
    label: hasWithMask
      ? "✅ Có khẩu trang: Đã đăng ký"
      : "❌ Có khẩu trang: Chưa đăng ký",
    enabled: false,
  });
  faceSubmenu.push({
    label: hasWithGlasses
      ? "✅ Đeo kính: Đã đăng ký"
      : "❌ Đeo kính: Chưa đăng ký",
    enabled: false,
  });

  const template = [
    ...(isMac
      ? [
          {
            label: app.getName(),
            submenu: [
              { role: "about", label: "Giới thiệu" },
              { type: "separator" },
              { role: "services", label: "Dịch vụ" },
              { type: "separator" },
              { role: "hide", label: "Ẩn" },
              { role: "hideOthers", label: "Ẩn ứng dụng khác" },
              { role: "unhide", label: "Hiện tất cả" },
              { type: "separator" },
              { role: "quit", label: "Thoát" },
            ],
          },
        ]
      : []),
    {
      label: "Tập tin",
      submenu: [
        {
          label: "Dashboard",
          click: () => {
            if (mainWindow) mainWindow.loadURL(DASHBOARD_URL);
            else shell.openExternal(DASHBOARD_URL);
          },
        },
        { type: "separator" },
        {
          label: "Trang chủ",
          click: () => shell.openExternal("http://localhost:3000"),
        },
        { type: "separator" },
        ...(isMac
          ? []
          : [
              {
                label: "Thoát",
                accelerator: "Ctrl+Q",
                click: () => app.quit(),
              },
            ]),
      ],
    },
    {
      label: "Sửa",
      submenu: [
        { role: "undo", label: "Hoàn tác", accelerator: "CmdOrCtrl+Z" },
        { role: "redo", label: "Làm lại", accelerator: "CmdOrCtrl+Shift+Z" },
        { type: "separator" },
        { role: "cut", label: "Cắt", accelerator: "CmdOrCtrl+X" },
        { role: "copy", label: "Sao chép", accelerator: "CmdOrCtrl+C" },
        { role: "paste", label: "Dán", accelerator: "CmdOrCtrl+V" },
        { role: "selectAll", label: "Chọn tất cả", accelerator: "CmdOrCtrl+A" },
      ],
    },
    {
      label: "Xem",
      submenu: [
        { role: "reload", label: "Tải lại" },
        { role: "forceReload", label: "Tải lại mạnh" },
        { role: "toggleDevTools", label: "Công cụ phát triển" },
        { type: "separator" },
        { role: "resetZoom", label: "Thu phóng mặc định" },
        { role: "zoomIn", label: "Phóng to" },
        { role: "zoomOut", label: "Thu nhỏ" },
        { type: "separator" },
        { role: "togglefullscreen", label: "Toàn màn hình" },
      ],
    },
    {
      label: "Face ID",
      submenu: faceSubmenu,
    },
    ...(isMac
      ? [
          {
            label: "Cửa sổ",
            submenu: [
              { role: "minimize", label: "Thu nhỏ" },
              { role: "zoom", label: "Phóng to" },
              { type: "separator" },
              { role: "front", label: "Đưa lên trước" },
            ],
          },
        ]
      : []),
    {
      label: "Trợ giúp",
      submenu: [
        {
          label: "Website hỗ trợ",
          click: () => shell.openExternal("https://bhtdev.work"),
        },
        { type: "separator" },
        {
          label: "Liên hệ hỗ trợ",
          click: () => shell.openExternal("mailto:buihaitrong.dev@gmail.com"),
        },
        { type: "separator" },
        { label: "Phiên bản 1.0.0", enabled: false },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// ===================== IPC HANDLERS =====================
ipcMain.handle("copy-to-clipboard", (event, text) => {
  try {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) win.focus();
    for (let i = 0; i < 3; i++) {
      clipboard.writeText(text);
      if (clipboard.readText() === text) return true;
      if (i < 2) {
        const start = Date.now();
        while (Date.now() - start < 100) {}
      }
    }
    return false;
  } catch (error) {
    return false;
  }
});

ipcMain.handle("read-from-clipboard", () => {
  try {
    return clipboard.readText();
  } catch (error) {
    return "";
  }
});

ipcMain.on("minimize-window", () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on("maximize-window", () => {
  if (mainWindow) {
    mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
  }
});

ipcMain.on("quit-app", () => app.quit());

ipcMain.on("loading-ready", () => {
  if (!mainWindow && !isMainReady) {
    createMainWindow();
  } else {
    hideLoading();
  }
});

ipcMain.on("update-loading", (event, type) => {
  createLoadingWindow(type);
});

ipcMain.on("close-login-loading", () => {
  hideLoading();
});

// ===================== FACE ID IPC =====================
ipcMain.handle("face:has-descriptor", () => {
  try {
    return hasAnyFaceRegistered();
  } catch (err) {
    return false;
  }
});

ipcMain.handle("face:has-type", (event, faceType) => {
  try {
    const registered = getRegisteredFaceTypes();
    return registered.includes(faceType);
  } catch (err) {
    return false;
  }
});

ipcMain.handle("face:list-types", () => {
  try {
    return getRegisteredFaceTypes();
  } catch (err) {
    return [];
  }
});

ipcMain.handle("face:save-descriptor", (event, payload) => {
  try {
    let faceType, descriptor;

    if (Array.isArray(payload)) {
      faceType = "noMask";
      descriptor = payload;
      console.warn("[Face IPC] Legacy call, defaulting to noMask");
    } else {
      faceType = payload.faceType;
      descriptor = payload.descriptor;
    }

    if (!FACE_TYPES[faceType]) {
      throw new Error(`Face type không hợp lệ: ${faceType}`);
    }

    if (!Array.isArray(descriptor) || descriptor.length !== 128) {
      throw new Error("Descriptor không hợp lệ (phải có 128 số)");
    }

    if (!safeStorage.isEncryptionAvailable()) {
      throw new Error("Mã hóa hệ thống không khả dụng");
    }

    let profiles = loadAllFaceProfiles();
    if (!profiles) profiles = {};

    profiles[faceType] = descriptor;

    if (!saveAllFaceProfiles(profiles)) {
      throw new Error("Không lưu được file");
    }

    const meta = loadFaceMetadata();
    if (!meta.profiles) meta.profiles = {};
    meta.profiles[faceType] = {
      registeredAt: new Date().toISOString(),
      platform: process.platform,
      version: "2.0.0",
    };
    saveFaceMetadata(meta);

    console.log(
      `[Face IPC] ✅ Saved profile: ${faceType}, total: ${Object.keys(profiles).length}`,
    );

    return {
      success: true,
      message: `Đã lưu Face ID "${FACE_TYPES[faceType].label}"`,
      faceType,
    };
  } catch (err) {
    console.error("[Face IPC] save-descriptor error:", err);
    return { success: false, message: err.message };
  }
});

ipcMain.handle("face:load-descriptor", () => {
  try {
    if (!hasAnyFaceRegistered()) {
      return { success: false, message: "Chưa có Face ID" };
    }

    const profiles = loadAllFaceProfiles();
    if (!profiles || Object.keys(profiles).length === 0) {
      return { success: false, message: "Chưa có Face ID" };
    }

    console.log(
      "[Face IPC] ✅ Loaded profiles:",
      Object.keys(profiles).join(", "),
    );

    return {
      success: true,
      profiles,
      types: Object.keys(profiles),
    };
  } catch (err) {
    console.error("[Face IPC] load-descriptor error:", err);
    return { success: false, message: err.message };
  }
});

ipcMain.handle("face:delete-descriptor", () => {
  try {
    if (fs.existsSync(FACE_PROFILES_PATH)) fs.unlinkSync(FACE_PROFILES_PATH);
    if (fs.existsSync(FACE_METADATA_PATH)) fs.unlinkSync(FACE_METADATA_PATH);
    return { success: true };
  } catch (err) {
    return { success: false, message: err.message };
  }
});

ipcMain.handle("face:delete-type", (event, faceType) => {
  try {
    if (!FACE_TYPES[faceType]) {
      throw new Error(`Face type không hợp lệ: ${faceType}`);
    }

    const profiles = loadAllFaceProfiles() || {};
    delete profiles[faceType];

    if (Object.keys(profiles).length === 0) {
      if (fs.existsSync(FACE_PROFILES_PATH)) fs.unlinkSync(FACE_PROFILES_PATH);
      if (fs.existsSync(FACE_METADATA_PATH)) fs.unlinkSync(FACE_METADATA_PATH);
    } else {
      saveAllFaceProfiles(profiles);
      const meta = loadFaceMetadata();
      delete meta.profiles[faceType];
      saveFaceMetadata(meta);
    }

    return { success: true };
  } catch (err) {
    return { success: false, message: err.message };
  }
});

ipcMain.handle("face:get-metadata", () => loadFaceMetadata());

ipcMain.handle("face:get-types-info", () => {
  return FACE_TYPES;
});

ipcMain.handle("face:get-attempts", () => faceUnlockAttempts);

ipcMain.handle("face:reset-attempts", () => {
  faceUnlockAttempts = 0;
  return true;
});

// ===================== FACE UNLOCK SUCCESS =====================
ipcMain.on("face:unlock-success-ack", () => {
  console.log("[Main] 🎉 Face unlock SUCCESS → creating main window");

  isUnlockingInProgress = true;
  isTransitioningToMain = true;

  if (faceUnlockWindow && !faceUnlockWindow.isDestroyed()) {
    faceUnlockWindow.close();
    faceUnlockWindow = null;
  }

  createMainWindow({ fromUnlock: true });
});

// ===================== FACE UNLOCK FALLBACK =====================
ipcMain.on("face:fallback-login", () => {
  console.log("[Main] 🔄 Face unlock fallback → Google login");

  isUnlockingInProgress = true;
  isTransitioningToMain = true;

  if (faceUnlockWindow && !faceUnlockWindow.isDestroyed()) {
    faceUnlockWindow.close();
    faceUnlockWindow = null;
  }

  createMainWindow({ fromUnlock: false });
});

ipcMain.on("face:close-window", (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) win.close();
});

// ===================== APP LIFECYCLE =====================
app.whenReady().then(() => {
  console.log("[App] Ready");
  const faceRegistered = hasAnyFaceRegistered();
  console.log("[App] Face ID registered:", faceRegistered);
  console.log("[App] Registered types:", getRegisteredFaceTypes());

  if (FACE_TEST_MODE) {
    console.log("[App] 🧪 FACE TEST MODE");
    createFaceTestWindow();
    createMenu();
    return;
  }

  createMenu();

  if (faceRegistered) {
    console.log("[App] 🔒 Face registered → opening Face ID unlock");
    createFaceUnlockWindow();
  } else {
    console.log("[App] 🔓 No Face ID → normal flow");
    createLoadingWindow("init");
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      isMainReady = false;
      hasRedirectedToDashboard = false;
      faceUnlockAttempts = 0;
      isUnlockingInProgress = false;
      isTransitioningToMain = false;

      if (hasAnyFaceRegistered()) {
        createFaceUnlockWindow();
      } else {
        createLoadingWindow("init");
      }
    }
  });

  app.on("before-quit", () => {
    console.log("App quitting");
  });
});

app.on("window-all-closed", () => {
  if (isTransitioningToMain || isUnlockingInProgress) {
    console.log("[App] window-all-closed during transition → skipping quit");
    return;
  }

  if (process.platform !== "darwin") {
    app.quit();
  }
});

process.on("uncaughtException", (error) => {
  console.error("Error:", error);
});
