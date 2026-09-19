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

const FACE_TEST_MODE = false;

let mainWindow = null;
let faceTestWindow = null;
let faceRegisterWindow = null;
let faceUnlockWindow = null;
let faceManagerWindow = null;
let isMainReady = false;
let hasRedirectedToDashboard = false;
let isUnlockingInProgress = false;
let isTransitioningToMain = false;

const FACE_PROFILES_PATH = path.join(
  app.getPath("userData"),
  "face-profiles.enc",
);
const FACE_METADATA_PATH = path.join(app.getPath("userData"), "face-meta.json");
const DASHBOARD_URL = "https://hab-creative.com/admin/dashboard";
const LOGIN_URL = "https://hab-creative.com/admin/login";
const MAX_FACES = 3;

app.commandLine.appendSwitch("enable-gpu-rasterization");
app.commandLine.appendSwitch("enable-zero-copy");
app.commandLine.appendSwitch("enable-oop-rasterization");
app.commandLine.appendSwitch("disable-software-rasterizer");
app.commandLine.appendSwitch("js-flags", "--max-old-space-size=512");
app.commandLine.appendSwitch("disable-renderer-backgrounding");
app.commandLine.appendSwitch("ignore-gpu-blacklist");
app.commandLine.appendSwitch("enable-accelerated-2d-canvas");
app.commandLine.appendSwitch("use-gl", "angle");
app.commandLine.appendSwitch("enable-features", "VaapiVideoDecoder");

// ===================== FACE HELPERS =====================

function loadAllFaces() {
  try {
    if (!fs.existsSync(FACE_PROFILES_PATH)) return [];
    if (!safeStorage.isEncryptionAvailable()) {
      throw new Error("Mã hóa hệ thống không khả dụng");
    }
    const encrypted = fs.readFileSync(FACE_PROFILES_PATH);
    const decrypted = safeStorage.decryptString(encrypted);
    const parsed = JSON.parse(decrypted);
    const faces = parsed.faces || [];

    const validFaces = faces.filter((face) => {
      if (!face || typeof face !== "object") return false;

      if (Array.isArray(face.descriptors)) {
        return face.descriptors.every(
          (d) => Array.isArray(d) && d.length === 128,
        );
      }

      if (Array.isArray(face.descriptor) && face.descriptor.length === 128) {
        return true;
      }

      return false;
    });

    if (validFaces.length !== faces.length) {
      saveAllFaces(validFaces);
    }

    return validFaces;
  } catch (err) {
    console.error("[Face] Load error:", err);
    return [];
  }
}

function saveAllFaces(faces) {
  try {
    if (!safeStorage.isEncryptionAvailable())
      throw new Error("Mã hóa hệ thống không khả dụng");
    const jsonStr = JSON.stringify({ faces });
    const encrypted = safeStorage.encryptString(jsonStr);
    fs.writeFileSync(FACE_PROFILES_PATH, encrypted);
    return true;
  } catch (err) {
    console.error("[Face] Save error:", err);
    return false;
  }
}

function loadFaceMetadata() {
  try {
    if (!fs.existsSync(FACE_METADATA_PATH)) return { faces: [] };
    return JSON.parse(fs.readFileSync(FACE_METADATA_PATH, "utf-8"));
  } catch (_) {
    return { faces: [] };
  }
}

function saveFaceMetadata(metadata) {
  try {
    fs.writeFileSync(FACE_METADATA_PATH, JSON.stringify(metadata, null, 2));
    return true;
  } catch (_) {
    return false;
  }
}

function getFaceCount() {
  return loadAllFaces().length;
}

function hasAnyFaceRegistered() {
  return getFaceCount() > 0;
}

function deleteAllFaces() {
  try {
    if (fs.existsSync(FACE_PROFILES_PATH)) fs.unlinkSync(FACE_PROFILES_PATH);
    if (fs.existsSync(FACE_METADATA_PATH)) fs.unlinkSync(FACE_METADATA_PATH);
    return true;
  } catch (_) {
    return false;
  }
}

function deleteFaceByIndex(index) {
  try {
    const faces = loadAllFaces();
    if (index < 0 || index >= faces.length) return false;

    const newFaces = faces.filter((_, i) => i !== index);
    saveAllFaces(newFaces);

    const meta = loadFaceMetadata();
    if (meta.faces && meta.faces.length > index) {
      meta.faces.splice(index, 1);
      saveFaceMetadata(meta);
    }

    if (newFaces.length === 0) deleteAllFaces();
    return true;
  } catch (_) {
    return false;
  }
}

// ===================== FACE UNLOCK WINDOW =====================

function createFaceUnlockWindow() {
  isUnlockingInProgress = false;
  isTransitioningToMain = false;

  faceUnlockWindow = new BrowserWindow({
    width: 460,
    height: 680,
    resizable: false,
    frame: false,
    transparent: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
      webSecurity: false,
    },
    title: "Mở khóa",
    backgroundColor: "#000000",
    show: true,
  });

  faceUnlockWindow.loadFile("face-unlock.html");

  faceUnlockWindow.webContents.session.setPermissionRequestHandler(
    (webContents, permission, callback) => {
      callback(permission === "media");
    },
  );

  faceUnlockWindow.on("closed", () => {
    faceUnlockWindow = null;
    if (isUnlockingInProgress || isTransitioningToMain) return;
    if (!mainWindow && !isMainReady) app.quit();
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
  } catch (_) {}

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

  const targetUrl = isLoggedIn ? DASHBOARD_URL : LOGIN_URL;

  mainWindow.loadURL(targetUrl, {
    extraHeaders: "x-desktop-app: true\n",
  });

  let loginStarted = false;

  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (url.includes("accounts.google.com") || url.includes("google.com")) {
      if (!loginStarted) {
        loginStarted = true;
        // ⭐ Không tạo loading window nữa
      }
    }
  });

  mainWindow.webContents.on("did-finish-load", () => {
    loginStarted = false;
    mainWindow.show();
    mainWindow.focus();
    isMainReady = true;
    isTransitioningToMain = false;
  });

  mainWindow.webContents.on("did-fail-load", () => {
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

function setupCookieListener() {
  if (!mainWindow || mainWindow.isDestroyed()) return;

  const mainSession = session.fromPartition("persist:main");

  mainSession.cookies.on("changed", (event, cookie, cause, removed) => {
    if (
      cookie.name === "auth_token" &&
      !removed &&
      cause === "explicit" &&
      !hasRedirectedToDashboard
    ) {
      hasRedirectedToDashboard = true;

      setTimeout(() => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.loadURL(DASHBOARD_URL, {
            extraHeaders: "x-desktop-app: true\n",
          });
        }
      }, 400);
    }

    if (cookie.name === "auth_token" && removed) {
      hasRedirectedToDashboard = false;
    }
  });
}

// ===================== FACE REGISTER WINDOW =====================

function openFaceRegistration() {
  if (faceRegisterWindow && !faceRegisterWindow.isDestroyed()) {
    faceRegisterWindow.focus();
    return;
  }

  const count = getFaceCount();
  if (count >= MAX_FACES) {
    dialog.showMessageBox({
      type: "warning",
      title: "Đã đủ khuôn mặt",
      message: `Bạn đã đăng ký tối đa ${MAX_FACES} khuôn mặt.`,
      detail:
        "Vui lòng xóa bớt 1 khuôn mặt trong menu 'Quản lý Face ID' trước khi đăng ký mới.",
      buttons: ["OK"],
    });
    return;
  }

  faceRegisterWindow = new BrowserWindow({
    width: 460,
    height: 680,
    resizable: false,
    frame: false,
    transparent: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
      webSecurity: false,
    },
    title: "Đăng ký Face ID",
    backgroundColor: "#000000",
    show: true,
  });

  faceRegisterWindow.loadFile("face-register.html");

  faceRegisterWindow.webContents.session.setPermissionRequestHandler(
    (webContents, permission, callback) => {
      callback(permission === "media");
    },
  );

  faceRegisterWindow.on("closed", () => {
    faceRegisterWindow = null;
    createMenu();
  });
}

// ===================== FACE MANAGER WINDOW =====================

function openFaceManager() {
  if (faceManagerWindow && !faceManagerWindow.isDestroyed()) {
    faceManagerWindow.focus();
    return;
  }

  faceManagerWindow = new BrowserWindow({
    width: 520,
    height: 620,
    resizable: false,
    frame: false,
    transparent: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
      webSecurity: false,
    },
    title: "Quản lý Face ID",
    backgroundColor: "#0a0a0f",
    show: true,
  });

  faceManagerWindow.loadFile("face-manager.html");

  faceManagerWindow.on("closed", () => {
    faceManagerWindow = null;
    createMenu();
  });
}

// ===================== DELETE CONFIRM =====================

async function confirmDeleteOneFace(index) {
  const meta = loadFaceMetadata();
  const face = meta.faces?.[index];
  const faceName = face?.name || `Khuôn mặt #${index + 1}`;

  const result = await dialog.showMessageBox({
    type: "warning",
    title: `Xóa ${faceName}?`,
    message: `Bạn có chắc muốn xóa "${faceName}"?`,
    detail: face?.registeredAt
      ? `Đăng ký ngày: ${new Date(face.registeredAt).toLocaleString("vi-VN")}`
      : "",
    buttons: ["Hủy", "Xóa"],
    defaultId: 0,
    cancelId: 0,
  });

  if (result.response === 1) {
    const ok = deleteFaceByIndex(index);
    if (ok) {
      createMenu();
      if (faceManagerWindow && !faceManagerWindow.isDestroyed())
        faceManagerWindow.reload();
    }
  }
}

async function confirmDeleteAllFaces() {
  const count = getFaceCount();
  if (count === 0) return;

  const result = await dialog.showMessageBox({
    type: "warning",
    title: "Xóa tất cả Face ID?",
    message: `Bạn có chắc muốn xóa TẤT CẢ ${count} khuôn mặt?`,
    detail: "Bạn cần đăng ký lại để sử dụng Face ID.",
    buttons: ["Hủy", "Xóa tất cả"],
    defaultId: 0,
    cancelId: 0,
  });

  if (result.response === 1) {
    deleteAllFaces();
    createMenu();
    if (faceManagerWindow && !faceManagerWindow.isDestroyed())
      faceManagerWindow.reload();
  }
}

// ===================== FACE TEST =====================

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
    backgroundColor: "#000000",
  });

  faceTestWindow.loadFile("face-test.html");

  faceTestWindow.webContents.session.setPermissionRequestHandler(
    (webContents, permission, callback) => {
      callback(permission === "media");
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
  const count = getFaceCount();
  const hasAny = count > 0;
  const isFull = count >= MAX_FACES;

  const faceSubmenu = [
    {
      label: isFull
        ? `Đăng ký Face mới (đã đủ ${MAX_FACES}/${MAX_FACES})`
        : `Đăng ký Face mới (${count}/${MAX_FACES})`,
      accelerator: "CmdOrCtrl+Shift+1",
      enabled: !isFull,
      click: () => openFaceRegistration(),
    },
    {
      label: `Quản lý Face ID (${count}/${MAX_FACES})`,
      accelerator: "CmdOrCtrl+Shift+2",
      enabled: hasAny,
      click: () => openFaceManager(),
    },
    { type: "separator" },
    {
      label: "Xóa tất cả Face ID",
      enabled: hasAny,
      click: () => confirmDeleteAllFaces(),
    },
  ];

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
          click: () => shell.openExternal("https://hab-creative.com"),
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
    clipboard.writeText(text);
    return clipboard.readText() === text;
  } catch (_) {
    return false;
  }
});

ipcMain.handle("read-from-clipboard", () => {
  try {
    return clipboard.readText();
  } catch (_) {
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

// ⭐ ĐÃ XÓA CÁC IPC LIÊN QUAN LOADING:
// - loading-ready
// - update-loading
// - close-login-loading

// ===================== FACE IPC =====================

ipcMain.handle("face:has-any", () => {
  try {
    return hasAnyFaceRegistered();
  } catch (_) {
    return false;
  }
});

ipcMain.handle("face:count", () => {
  try {
    return getFaceCount();
  } catch (_) {
    return 0;
  }
});

ipcMain.handle("face:max", () => MAX_FACES);

ipcMain.handle("face:is-full", () => {
  try {
    return getFaceCount() >= MAX_FACES;
  } catch (_) {
    return false;
  }
});

ipcMain.handle("face:save", (event, payload) => {
  try {
    let descriptors;
    let eyesOpen;

    if (Array.isArray(payload) && typeof payload[0] === "number") {
      descriptors = [payload];
      eyesOpen = true;
    } else if (payload.descriptors && Array.isArray(payload.descriptors)) {
      descriptors = payload.descriptors;
      eyesOpen = payload.eyesOpen !== false;
    } else if (payload.descriptor) {
      descriptors = [payload.descriptor];
      eyesOpen = payload.eyesOpen !== false;
    } else {
      throw new Error("Payload không hợp lệ");
    }

    if (descriptors.length === 0) throw new Error("Cần ít nhất 1 descriptor");

    for (const d of descriptors) {
      if (!Array.isArray(d) || d.length !== 128) {
        throw new Error("Descriptor không hợp lệ (phải có 128 số)");
      }
    }

    if (!eyesOpen) throw new Error("Chỉ đăng ký khi cả 2 mắt đang mở");
    if (!safeStorage.isEncryptionAvailable())
      throw new Error("Mã hóa hệ thống không khả dụng");

    const faces = loadAllFaces();

    if (faces.length >= MAX_FACES) {
      throw new Error(
        `Đã đủ ${MAX_FACES} khuôn mặt. Vui lòng xóa bớt trước khi thêm.`,
      );
    }

    faces.push({
      descriptors,
      eyesOpen: true,
      registeredAt: new Date().toISOString(),
    });

    if (!saveAllFaces(faces)) throw new Error("Không lưu được file");

    const meta = loadFaceMetadata();
    if (!meta.faces) meta.faces = [];
    meta.faces.push({
      name: `Khuôn mặt #${faces.length}`,
      registeredAt: new Date().toISOString(),
      platform: process.platform,
      version: "6.0.0",
    });
    saveFaceMetadata(meta);

    return {
      success: true,
      message: `Đã lưu Face ID (${faces.length}/${MAX_FACES})`,
      count: faces.length,
      max: MAX_FACES,
      samples: descriptors.length,
    };
  } catch (err) {
    return { success: false, message: err.message };
  }
});

ipcMain.handle("face:load-all", () => {
  try {
    const faces = loadAllFaces();
    if (faces.length === 0) {
      return { success: false, message: "Chưa có Face ID nào" };
    }

    const people = faces.map((f) => {
      if (Array.isArray(f.descriptors)) return f.descriptors;
      if (Array.isArray(f.descriptor)) return [f.descriptor];
      return [];
    });

    return {
      success: true,
      faces: people,
      count: people.length,
    };
  } catch (err) {
    return { success: false, message: err.message };
  }
});

ipcMain.handle("face:delete-all", () => {
  try {
    deleteAllFaces();
    return { success: true };
  } catch (err) {
    return { success: false, message: err.message };
  }
});

ipcMain.handle("face:delete-one", (event, index) => {
  try {
    const ok = deleteFaceByIndex(index);
    const remaining = getFaceCount();
    return { success: ok, remaining };
  } catch (err) {
    return { success: false, message: err.message };
  }
});

ipcMain.handle("face:get-list", () => {
  try {
    const meta = loadFaceMetadata();
    const faces = loadAllFaces();
    const faceList = [];

    for (let i = 0; i < faces.length; i++) {
      faceList.push({
        name: meta.faces?.[i]?.name || `Khuôn mặt #${i + 1}`,
        registeredAt: meta.faces?.[i]?.registeredAt || null,
      });
    }

    return {
      success: true,
      faces: faceList,
      count: faces.length,
      max: MAX_FACES,
    };
  } catch (err) {
    return { success: false, message: err.message };
  }
});

// ===================== FACE UNLOCK EVENTS =====================

ipcMain.on("face:unlock-success-ack", () => {
  isUnlockingInProgress = true;
  isTransitioningToMain = true;

  if (faceUnlockWindow && !faceUnlockWindow.isDestroyed()) {
    faceUnlockWindow.close();
    faceUnlockWindow = null;
  }

  createMainWindow({ fromUnlock: true });
});

ipcMain.on("face:fallback-login", () => {
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
  const faceCount = getFaceCount();

  if (FACE_TEST_MODE) {
    createFaceTestWindow();
    createMenu();
    return;
  }

  createMenu();

  // ⭐ KHÔNG DÙNG LOADING NỮA
  // Nếu có face → mở face unlock
  // Nếu chưa có face → mở main window luôn (login page)
  if (faceCount > 0) {
    createFaceUnlockWindow();
  } else {
    createMainWindow();
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      isMainReady = false;
      hasRedirectedToDashboard = false;
      isUnlockingInProgress = false;
      isTransitioningToMain = false;

      if (getFaceCount() > 0) createFaceUnlockWindow();
      else createMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (isTransitioningToMain || isUnlockingInProgress) return;
  if (process.platform !== "darwin") app.quit();
});

process.on("uncaughtException", (error) => {
  console.error("Error:", error);
});
