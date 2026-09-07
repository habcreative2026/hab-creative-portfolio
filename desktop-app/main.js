const {
  app,
  BrowserWindow,
  Menu,
  ipcMain,
  shell,
  session,
  clipboard,
} = require("electron");
const path = require("path");

let mainWindow = null;
let loadingWindow = null;
let isMainReady = false;

app.commandLine.appendSwitch("enable-gpu-rasterization");
app.commandLine.appendSwitch("enable-zero-copy");
app.commandLine.appendSwitch("enable-oop-rasterization");
app.commandLine.appendSwitch("disable-software-rasterizer");
app.commandLine.appendSwitch("js-flags", "--max-old-space-size=512");
app.commandLine.appendSwitch("disable-renderer-backgrounding");

// ===================== LOADING WINDOW =====================
function createLoadingWindow(type = "init") {
  // 👉 NẾU ĐÃ CÓ WINDOW VÀ CHƯA BỊ HỦY, CHỈ CẦN UPDATE
  if (loadingWindow && !loadingWindow.isDestroyed()) {
    console.log("[Loading] Window exists, updating content to:", type);
    loadingWindow.webContents.send("update-loading", type);
    loadingWindow.show();
    return loadingWindow;
  }

  // 👉 NẾU WINDOW ĐÃ BỊ HỦY, TẠO LẠI
  console.log("[Loading] Creating new loading window");
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
    console.log("[Loading] Window closed");
    loadingWindow = null;
  });

  return loadingWindow;
}

function hideLoading() {
  if (loadingWindow && !loadingWindow.isDestroyed()) {
    console.log("[Loading] Hiding loading window");
    loadingWindow.close();
    loadingWindow = null;
  }
}

// ===================== MAIN WINDOW =====================
function createMainWindow() {
  const mainSession = session.fromPartition("persist:main");

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
    frame: true,
    transparent: false,
  });

  mainWindow.loadURL("https://hab-creative.com/admin/login", {
    extraHeaders: "x-desktop-app: true\n",
  });

  let loginStarted = false;

  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (url.includes("accounts.google.com") || url.includes("google.com")) {
      console.log("[Main] Going to Google login");
      if (!loginStarted) {
        loginStarted = true;
        // 👉 CẬP NHẬT NỘI DUNG LOADING, KHÔNG TẠO MỚI
        createLoadingWindow("login");
      }
    }
  });

  mainWindow.webContents.on("did-finish-load", () => {
    console.log("[Main] Main window finished loading");

    // 👉 ĐÓNG LOADING
    hideLoading();
    loginStarted = false;

    mainWindow.show();
    mainWindow.focus();
    isMainReady = true;

    mainWindow.webContents.executeJavaScript(`
      (function() {
        console.log('[Fix] Applying clipboard fix for MacOS');
        
        document.addEventListener('copy', function(e) {
          console.log('[Fix] Copy event intercepted');
          return true;
        }, true);
        
        document.addEventListener('paste', function(e) {
          console.log('[Fix] Paste event intercepted');
          return true;
        }, true);
        
        if (navigator.clipboard) {
          const originalWrite = navigator.clipboard.writeText;
          const originalRead = navigator.clipboard.readText;
          
          navigator.clipboard.writeText = async function(text) {
            console.log('[Fix] Clipboard write:', text);
            try {
              if (window.electronAPI && window.electronAPI.copyToClipboard) {
                await window.electronAPI.copyToClipboard(text);
              }
              return await originalWrite.call(this, text);
            } catch (err) {
              console.error('[Fix] Write error:', err);
              return Promise.resolve();
            }
          };
          
          navigator.clipboard.readText = async function() {
            console.log('[Fix] Clipboard read');
            try {
              return await originalRead.call(this);
            } catch (err) {
              console.error('[Fix] Read error:', err);
              return '';
            }
          };
        }
        
        console.log('[Fix] Clipboard fix applied');
      })();
    `);
  });

  mainWindow.webContents.on("did-fail-load", () => {
    console.log("[Main] Main window failed to load");
    hideLoading();
    loginStarted = false;
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.includes("accounts.google.com") || url.includes("google.com")) {
      return { action: "allow" };
    }
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.webContents.session.cookies.on(
    "changed",
    (event, cookie, cause, removed) => {
      if (cookie.name === "auth_token" && !removed) {
        console.log("[Main] Login success, going to dashboard");
        // 👉 CẬP NHẬT NỘI DUNG LOADING, KHÔNG TẠO MỚI
        createLoadingWindow("login");
        mainWindow.loadURL("https://hab-creative.com/admin/dashboard");
      }
    },
  );

  mainWindow.on("closed", () => {
    console.log("[Main] Main window closed");
    mainWindow = null;
    isMainReady = false;
  });
}

// ===================== MENU =====================
function createMenu() {
  const isMac = process.platform === "darwin";

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
            if (mainWindow) {
              mainWindow.loadURL("https://hab-creative.com/admin/dashboard");
            } else {
              shell.openExternal("https://hab-creative.com/admin/dashboard");
            }
          },
        },
        { type: "separator" },
        {
          label: "Trang chủ",
          click: () => {
            shell.openExternal("https://hab-creative.com");
          },
        },
        { type: "separator" },
        ...(isMac
          ? []
          : [
              {
                label: "Thoát",
                accelerator: "Ctrl+Q",
                click: () => {
                  app.quit();
                },
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
          label: "Website",
          click: () => {
            shell.openExternal("https://hab-creative.com");
          },
        },
        { type: "separator" },
        {
          label: "Liên hệ hỗ trợ",
          click: () => {
            shell.openExternal("mailto:buihaitrong.dev@gmail.com");
          },
        },
        { type: "separator" },
        {
          label: "Phiên bản 1.0.0",
          enabled: false,
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// ===================== IPC HANDLERS =====================
ipcMain.handle("copy-to-clipboard", (event, text) => {
  try {
    console.log("[Main] Copy on platform:", process.platform);
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) win.focus();

    for (let i = 0; i < 3; i++) {
      clipboard.writeText(text);
      if (clipboard.readText() === text) {
        console.log(`[Main] Copy success on attempt ${i + 1}`);
        return true;
      }
      if (i < 2) {
        const start = Date.now();
        while (Date.now() - start < 100) {}
      }
    }
    return false;
  } catch (error) {
    console.error("[Main] Copy error:", error);
    return false;
  }
});

ipcMain.handle("read-from-clipboard", () => {
  try {
    return clipboard.readText();
  } catch (error) {
    console.error("[Main] Read error:", error);
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

ipcMain.on("quit-app", () => {
  app.quit();
});

// 👉 LOADING READY
ipcMain.on("loading-ready", () => {
  console.log("[Main] Loading ready, creating main window...");
  if (!mainWindow && !isMainReady) {
    createMainWindow();
  } else {
    hideLoading();
  }
});

// 👉 UPDATE LOADING TỪ RENDERER
ipcMain.on("update-loading", (event, type) => {
  console.log("[Main] Update loading to type:", type);
  createLoadingWindow(type);
});

// ===================== APP LIFECYCLE =====================
app.whenReady().then(() => {
  console.log("[App] Ready, creating loading window");
  createLoadingWindow("init");
  createMenu();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      isMainReady = false;
      createLoadingWindow("init");
    }
  });

  app.on("before-quit", () => {
    console.log("App quitting");
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

process.on("uncaughtException", (error) => {
  console.error("Error:", error);
});
