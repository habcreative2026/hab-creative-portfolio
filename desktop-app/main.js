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
const { autoUpdater } = require("electron-updater");
const log = require("electron-log");

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

let isDownloadingUpdate = false;
let downloadProgressWindow = null;

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

function isSafeStorageAvailable() {
  try {
    return safeStorage.isEncryptionAvailable();
  } catch (err) {
    console.warn("[Face] safeStorage check error:", err);
    return false;
  }
}

function loadAllFaces() {
  try {
    if (!fs.existsSync(FACE_PROFILES_PATH)) return [];

    const raw = fs.readFileSync(FACE_PROFILES_PATH);
    let parsed;

    if (isSafeStorageAvailable()) {
      try {
        const decrypted = safeStorage.decryptString(raw);
        parsed = JSON.parse(decrypted);
      } catch (err) {
        console.warn("[Face] Decrypt failed, trying plain JSON:", err);
        try {
          parsed = JSON.parse(raw.toString("utf-8"));
        } catch (_) {
          console.error("[Face] Cannot parse face file");
          return [];
        }
      }
    } else {
      console.warn(
        "[Face] safeStorage not available, reading plain JSON (Linux fallback)",
      );
      try {
        parsed = JSON.parse(raw.toString("utf-8"));
      } catch (err) {
        console.error("[Face] Cannot parse plain JSON:", err);
        return [];
      }
    }

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
    const jsonStr = JSON.stringify({ faces });

    if (isSafeStorageAvailable()) {
      try {
        const encrypted = safeStorage.encryptString(jsonStr);
        fs.writeFileSync(FACE_PROFILES_PATH, encrypted);
        return true;
      } catch (err) {
        console.error("[Face] Encrypt failed, saving plain JSON:", err);
        fs.writeFileSync(FACE_PROFILES_PATH, jsonStr, "utf-8");
        return true;
      }
    } else {
      console.warn(
        "[Face] safeStorage not available, saving plain JSON (Linux fallback)",
      );
      fs.writeFileSync(FACE_PROFILES_PATH, jsonStr, "utf-8");
      return true;
    }
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
          label: "Kiểm tra cập nhật",
          click: () => {
            if (!app.isPackaged) {
              dialog.showMessageBox({
                type: "info",
                title: "Chế độ Dev",
                message: "Không thể kiểm tra cập nhật trong chế độ phát triển.",
                buttons: ["OK"],
              });
              return;
            }
            manualCheckForUpdates();
          },
        },
        { type: "separator" },
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
        { label: `Phiên bản ${app.getVersion()}`, enabled: false },
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

const { pathToFileURL } = require("url");

ipcMain.handle("get-models-path", () => {
  try {
    const isDev = !app.isPackaged;
    let modelsPath;
    if (isDev) {
      modelsPath = path.join(__dirname, "models");
    } else {
      modelsPath = path.join(process.resourcesPath, "models");
    }
    const urlPath = pathToFileURL(modelsPath).href + "/";
    console.log("[App] Models path:", modelsPath);
    return urlPath;
  } catch (err) {
    console.error("[App] get-models-path error:", err);
    return "./models/";
  }
});

ipcMain.handle("get-libs-path", () => {
  try {
    const isDev = !app.isPackaged;
    if (isDev) {
      const tfPath = path.join(
        __dirname,
        "node_modules",
        "@tensorflow",
        "tfjs",
        "dist",
        "tf.min.js",
      );
      const faceApiPath = path.join(
        __dirname,
        "node_modules",
        "face-api.js",
        "dist",
        "face-api.min.js",
      );
      return {
        tf: pathToFileURL(tfPath).href,
        faceApi: pathToFileURL(faceApiPath).href,
      };
    } else {
      const libsPath = path.join(process.resourcesPath, "libs");
      return {
        tf: pathToFileURL(path.join(libsPath, "tf.min.js")).href,
        faceApi: pathToFileURL(path.join(libsPath, "face-api.min.js")).href,
      };
    }
  } catch (err) {
    console.error("[App] get-libs-path error:", err);
    return {
      tf: "./node_modules/@tensorflow/tfjs/dist/tf.min.js",
      faceApi: "./node_modules/face-api.js/dist/face-api.min.js",
    };
  }
});

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
      version: app.getVersion(),
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

// ===================== AUTO UPDATER =====================

function createDownloadProgressWindow() {
  if (downloadProgressWindow && !downloadProgressWindow.isDestroyed()) {
    return downloadProgressWindow;
  }

  downloadProgressWindow = new BrowserWindow({
    width: 420,
    height: 180,
    resizable: false,
    frame: true,
    minimizable: false,
    maximizable: false,
    closable: false,
    alwaysOnTop: true,
    center: true,
    title: "Đang tải bản cập nhật...",
    backgroundColor: "#1a1a2e",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    show: true,
  });

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          color: #fff;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100vh;
          padding: 20px;
          -webkit-user-select: none;
          user-select: none;
        }
        h2 {
          font-size: 15px;
          font-weight: 600;
          margin-bottom: 14px;
          text-align: center;
        }
        .bar-container {
          width: 100%;
          height: 10px;
          background: rgba(255,255,255,0.15);
          border-radius: 5px;
          overflow: hidden;
          margin-bottom: 10px;
        }
        .bar {
          height: 100%;
          width: 0%;
          background: linear-gradient(90deg, #4ade80, #22d3ee);
          border-radius: 5px;
          transition: width 0.3s ease;
        }
        .percent {
          font-size: 22px;
          font-weight: 700;
          color: #22d3ee;
        }
        .status {
          font-size: 11px;
          color: #94a3b8;
          margin-top: 8px;
        }
      </style>
    </head>
    <body>
      <h2>Đang tải bản cập nhật...</h2>
      <div class="bar-container">
        <div class="bar" id="bar"></div>
      </div>
      <div class="percent" id="percent">0%</div>
      <div class="status" id="status">Vui lòng đợi trong giây lát</div>
    </body>
    </html>
  `;

  downloadProgressWindow.loadURL(
    "data:text/html;charset=utf-8," + encodeURIComponent(html),
  );

  return downloadProgressWindow;
}

function updateDownloadProgress(percent, transferred, total) {
  if (!downloadProgressWindow || downloadProgressWindow.isDestroyed()) return;

  const p = Math.round(percent);
  const mbTransferred = (transferred / 1024 / 1024).toFixed(2);
  const mbTotal = (total / 1024 / 1024).toFixed(2);

  downloadProgressWindow.webContents
    .executeJavaScript(
      `
      document.getElementById('bar').style.width = '${p}%';
      document.getElementById('percent').textContent = '${p}%';
      document.getElementById('status').textContent = '${mbTransferred} MB / ${mbTotal} MB';
    `,
    )
    .catch(() => {});
}

function closeDownloadProgressWindow() {
  if (downloadProgressWindow && !downloadProgressWindow.isDestroyed()) {
    downloadProgressWindow.close();
    downloadProgressWindow = null;
  }
}

function manualCheckForUpdates() {
  if (isDownloadingUpdate) {
    dialog.showMessageBox({
      type: "info",
      title: "Đang tải",
      message: "Đang có bản cập nhật được tải xuống. Vui lòng đợi.",
      buttons: ["OK"],
    });
    return;
  }

  log.info("[Updater] Manual check triggered");

  const getParentWindow = () => {
    if (mainWindow && !mainWindow.isDestroyed()) return mainWindow;
    if (faceUnlockWindow && !faceUnlockWindow.isDestroyed())
      return faceUnlockWindow;
    return null;
  };

  autoUpdater
    .checkForUpdates()
    .then((result) => {
      log.info(
        "[Updater] Manual check result:",
        JSON.stringify(result?.updateInfo || {}),
      );
      // Nếu không có update, hiện thông báo
      if (
        !result ||
        !result.updateInfo ||
        result.updateInfo.version === app.getVersion()
      ) {
        const parentWin = getParentWindow();
        const options = {
          type: "info",
          title: "Đã là bản mới nhất",
          message: `Bạn đang dùng phiên bản mới nhất (${app.getVersion()}).`,
          buttons: ["OK"],
        };
        parentWin
          ? dialog.showMessageBox(parentWin, options)
          : dialog.showMessageBox(options);
      }
    })
    .catch((err) => {
      log.error("[Updater] Manual check failed:", err.message);
      const parentWin = getParentWindow();
      const options = {
        type: "error",
        title: "Lỗi kiểm tra cập nhật",
        message: err.message || "Không thể kiểm tra bản cập nhật",
        buttons: ["OK"],
      };
      parentWin
        ? dialog.showMessageBox(parentWin, options)
        : dialog.showMessageBox(options);
    });
}

function setupAutoUpdater() {
  if (!app.isPackaged) {
    log.info("[Updater] Dev mode - skip auto update");
    console.log("[Updater] Dev mode - skip auto update");
    return;
  }

  const platform = process.platform;
  log.info(`[Updater] Platform: ${platform}`);
  console.log(`[Updater] Platform: ${platform}`);

  if (platform === "darwin") {
    log.info("[Updater] macOS → check-only mode");
    console.log("[Updater] macOS → check-only mode");
    setupMacOSUpdater();
    return;
  }

  log.info(`[Updater] ${platform} → full auto-update mode`);
  console.log(`[Updater] ${platform} → full auto-update mode`);
  setupFullAutoUpdater();
}

function setupMacOSUpdater() {
  const https = require("https");

  const RELEASES_URL =
    "https://github.com/habcreative2026/hab-creative-portfolio/releases/latest";

  // ⭐ Helper lấy parent window
  const getParentWindow = () => {
    if (mainWindow && !mainWindow.isDestroyed()) return mainWindow;
    if (faceUnlockWindow && !faceUnlockWindow.isDestroyed())
      return faceUnlockWindow;
    if (faceRegisterWindow && !faceRegisterWindow.isDestroyed())
      return faceRegisterWindow;
    if (faceManagerWindow && !faceManagerWindow.isDestroyed())
      return faceManagerWindow;
    return null;
  };

  const checkVersion = () => {
    const options = {
      hostname: "api.github.com",
      path: "/repos/habcreative2026/hab-creative-portfolio/releases/latest",
      headers: { "User-Agent": "HAB-Creative-App" },
    };

    https
      .get(options, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const release = JSON.parse(data);
            const latestVersion = (release.tag_name || "").replace("v", "");
            const currentVersion = app.getVersion();

            log.info(
              `[Updater] macOS check: current=${currentVersion}, latest=${latestVersion}`,
            );

            if (isNewerVersion(latestVersion, currentVersion)) {
              log.info(
                `[Updater] macOS: New version available ${latestVersion}`,
              );

              const showMacDialog = (retries = 3) => {
                const parentWin = getParentWindow();

                if (!parentWin && retries > 0) {
                  log.info(
                    `[Updater] macOS: No window yet, retry in 500ms (${retries} left)`,
                  );
                  setTimeout(() => showMacDialog(retries - 1), 500);
                  return;
                }

                const dialogOptions = {
                  type: "info",
                  title: "Có bản cập nhật mới",
                  message: `Phiên bản ${latestVersion} đã sẵn sàng!`,
                  detail:
                    "Bạn đang dùng phiên bản cũ. Mở trang tải để tải bản mới nhất cho macOS?",
                  buttons: ["Mở trang tải", "Để sau"],
                  defaultId: 0,
                  cancelId: 1,
                };

                const dialogPromise = parentWin
                  ? dialog.showMessageBox(parentWin, dialogOptions)
                  : dialog.showMessageBox(dialogOptions);

                dialogPromise.then((result) => {
                  if (result.response === 0) {
                    log.info("[Updater] macOS: Opening:", RELEASES_URL);
                    shell.openExternal(RELEASES_URL);
                  }
                });
              };

              showMacDialog();
            } else {
              log.info("[Updater] macOS: Already latest version");
            }
          } catch (err) {
            log.warn("[Updater] macOS parse error:", err.message);
          }
        });
      })
      .on("error", (err) => {
        log.warn("[Updater] macOS check failed:", err.message);
      });
  };

  // ⭐ Auto check sau 3s
  setTimeout(checkVersion, 3000);

  // ⭐ Periodic check mỗi 4 giờ
  setInterval(checkVersion, 4 * 60 * 60 * 1000);
}

function setupFullAutoUpdater() {
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.allowPrerelease = false;
  autoUpdater.differentialDownload = false;

  try {
    autoUpdater.logger = log;
    if (log && log.transports) {
      if (log.transports.file) log.transports.file.level = "info";
      if (log.transports.console) log.transports.console.level = "info";
    }
  } catch (loggerErr) {
    console.warn("[Updater] Logger config failed:", loggerErr.message);
  }

  log.info("[Updater] INIT");

  autoUpdater.on("checking-for-update", () => {
    log.info("[Updater] Checking for updates...");
  });

  autoUpdater.on("update-available", (info) => {
    log.info(`[Updater] UPDATE AVAILABLE: ${info.version}`);

    if (isDownloadingUpdate) {
      log.info("[Updater] Already downloading, skip dialog");
      return;
    }

    // ⭐ Helper: lấy bất kỳ window nào đang mở làm parent
    const getParentWindow = () => {
      if (mainWindow && !mainWindow.isDestroyed()) return mainWindow;
      if (faceUnlockWindow && !faceUnlockWindow.isDestroyed())
        return faceUnlockWindow;
      if (faceRegisterWindow && !faceRegisterWindow.isDestroyed())
        return faceRegisterWindow;
      if (faceManagerWindow && !faceManagerWindow.isDestroyed())
        return faceManagerWindow;
      return null;
    };

    // ⭐ Retry nếu chưa có window nào
    const showUpdateDialog = (retries = 3) => {
      const parentWin = getParentWindow();

      if (!parentWin && retries > 0) {
        log.info(`[Updater] No window yet, retry in 500ms (${retries} left)`);
        setTimeout(() => showUpdateDialog(retries - 1), 500);
        return;
      }

      const dialogOptions = {
        type: "info",
        title: "Có bản cập nhật mới",
        message: `Phiên bản ${info.version} đã sẵn sàng!`,
        detail: `Bạn đang dùng phiên bản ${app.getVersion()}. Cập nhật ngay?`,
        buttons: ["Cập nhật ngay", "Để sau"],
        defaultId: 0,
        cancelId: 1,
      };

      const dialogPromise = parentWin
        ? dialog.showMessageBox(parentWin, dialogOptions)
        : dialog.showMessageBox(dialogOptions);

      dialogPromise.then((result) => {
        log.info(`[Updater] DIALOG RESULT: ${result.response}`);

        if (result.response === 0) {
          log.info("[Updater] USER ACCEPTED - STARTING DOWNLOAD");
          isDownloadingUpdate = true;

          createDownloadProgressWindow();

          setTimeout(() => {
            autoUpdater
              .downloadUpdate()
              .then(() => {
                log.info("[Updater] downloadUpdate() resolved");
              })
              .catch((err) => {
                log.error("[Updater] DOWNLOAD ERROR:", err.message);
                log.error("[Updater] STACK:", err.stack);
                isDownloadingUpdate = false;
                closeDownloadProgressWindow();

                const errOptions = {
                  type: "error",
                  title: "Lỗi tải bản cập nhật",
                  message: err.message || "Không thể tải bản cập nhật",
                  detail: err.stack || "",
                  buttons: ["OK"],
                };

                const errParent = getParentWindow();
                errParent
                  ? dialog.showMessageBox(errParent, errOptions)
                  : dialog.showMessageBox(errOptions);
              });
          }, 300);
        } else {
          log.info("[Updater] User postponed update");
        }
      });
    };

    showUpdateDialog();
  });

  autoUpdater.on("update-not-available", (info) => {
    log.info(`[Updater] No update. Current: ${info.version}`);
  });

  autoUpdater.on("download-progress", (progressObj) => {
    const percent = progressObj.percent.toFixed(1);
    log.info(`[Updater] PROGRESS: ${percent}%`);

    updateDownloadProgress(
      progressObj.percent,
      progressObj.transferred,
      progressObj.total,
    );

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.setTitle(`Đang tải bản cập nhật... ${percent}%`);
    }
  });

  autoUpdater.on("update-downloaded", (info) => {
    log.info(`[Updater] DOWNLOADED: ${info.version}`);

    isDownloadingUpdate = false;
    closeDownloadProgressWindow();

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.setTitle("HAB CREATIVE");
    }

    const getParentWindow = () => {
      if (mainWindow && !mainWindow.isDestroyed()) return mainWindow;
      if (faceUnlockWindow && !faceUnlockWindow.isDestroyed())
        return faceUnlockWindow;
      return null;
    };

    const dialogOptions = {
      type: "info",
      title: "Đã tải xong",
      message: `Phiên bản ${info.version} đã sẵn sàng cài đặt.`,
      detail: "Ứng dụng sẽ khởi động lại để hoàn tất cập nhật.",
      buttons: ["Khởi động lại ngay", "Để sau"],
      defaultId: 0,
      cancelId: 1,
    };

    const parentWin = getParentWindow();
    const dialogPromise = parentWin
      ? dialog.showMessageBox(parentWin, dialogOptions)
      : dialog.showMessageBox(dialogOptions);

    dialogPromise.then((result) => {
      if (result.response === 0) {
        log.info("[Updater] INSTALLING...");
        autoUpdater.quitAndInstall(false, true);
      }
    });
  });

  autoUpdater.on("error", (err) => {
    const msg = err?.message || "Unknown error";
    log.error("[Updater] ERROR:", msg);
    log.error("[Updater] STACK:", err?.stack);

    isDownloadingUpdate = false;
    closeDownloadProgressWindow();

    if (
      msg.includes("404") ||
      msg.includes("No published versions") ||
      msg.includes("is not defined") ||
      msg.includes("net::ERR")
    ) {
      log.warn("[Updater] Ignored library error:", msg);
      return;
    }

    const getParentWindow = () => {
      if (mainWindow && !mainWindow.isDestroyed()) return mainWindow;
      if (faceUnlockWindow && !faceUnlockWindow.isDestroyed())
        return faceUnlockWindow;
      return null;
    };

    const errOptions = {
      type: "error",
      title: "Lỗi cập nhật",
      message: "Không thể kiểm tra bản cập nhật",
      detail: msg,
      buttons: ["OK"],
    };

    const parentWin = getParentWindow();
    parentWin
      ? dialog.showMessageBox(parentWin, errOptions)
      : dialog.showMessageBox(errOptions);
  });

  // ⭐ Auto check sau 3s khi app mở
  setTimeout(() => {
    log.info("[Updater] Auto check after 3s");
    try {
      autoUpdater.checkForUpdates().catch((err) => {
        log.warn("[Updater] Auto check failed:", err.message);
      });
    } catch (err) {
      log.warn("[Updater] Auto check threw synchronously:", err.message);
    }
  }, 3000);

  // ⭐ Periodic check mỗi 1 giờ
  setInterval(
    () => {
      if (isDownloadingUpdate) return;
      autoUpdater.checkForUpdates().catch((err) => {
        log.warn("[Updater] Periodic check failed:", err.message);
      });
    },
    60 * 60 * 1000,
  );

  log.info("[Updater] READY");
}

function isNewerVersion(latest, current) {
  if (!latest || !current) return false;

  const l = String(latest)
    .split(".")
    .map((n) => parseInt(n) || 0);
  const c = String(current)
    .split(".")
    .map((n) => parseInt(n) || 0);

  for (let i = 0; i < Math.max(l.length, c.length); i++) {
    const lv = l[i] || 0;
    const cv = c[i] || 0;
    if (lv > cv) return true;
    if (lv < cv) return false;
  }
  return false;
}

// ===================== APP LIFECYCLE =====================

app.whenReady().then(() => {
  const faceCount = getFaceCount();

  setupAutoUpdater();

  if (FACE_TEST_MODE) {
    createFaceTestWindow();
    createMenu();
    return;
  }

  createMenu();

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
