const {
  app,
  BrowserWindow,
  Menu,
  ipcMain,
  shell,
  session,
  dialog,
  clipboard,
} = require("electron");
const path = require("path");
const os = require("os");
const crypto = require("crypto");

let mainWindow = null;
let loadingWindow = null;
let loginLoadingWindow = null;
let cachedDeviceId = null;
let isAppReady = false;

// ⭐ TỐI ƯU HỆ THỐNG - BẬT GPU
app.commandLine.appendSwitch("enable-gpu-rasterization");
app.commandLine.appendSwitch("enable-zero-copy");
app.commandLine.appendSwitch("enable-oop-rasterization");
app.commandLine.appendSwitch("disable-software-rasterizer");
app.commandLine.appendSwitch("js-flags", "--max-old-space-size=512");
app.commandLine.appendSwitch("disable-renderer-backgrounding");

// ===== DEVICE ID CỐ ĐỊNH (CÓ CACHE) =====
function getDeviceId() {
  if (cachedDeviceId) {
    return cachedDeviceId;
  }

  try {
    const networkInterfaces = os.networkInterfaces();
    let macAddress = "";

    for (const name in networkInterfaces) {
      const interfaces = networkInterfaces[name];
      for (const iface of interfaces) {
        if (!iface.internal && iface.mac && iface.mac !== "00:00:00:00:00:00") {
          macAddress = iface.mac;
          break;
        }
      }
      if (macAddress) break;
    }

    const hostname = os.hostname();
    const username = os.userInfo().username;
    const platform = os.platform();
    const arch = os.arch();
    const release = os.release();
    const totalMem = os.totalmem();
    const cpuModel = os.cpus()[0]?.model || "Unknown";

    let rawData = "";

    if (macAddress && macAddress !== "00:00:00:00:00:00") {
      const cleanMac = macAddress
        .replace(/:/g, "")
        .replace(/-/g, "")
        .toUpperCase();
      rawData = [
        hostname,
        cleanMac,
        username,
        platform,
        arch,
        release,
        cpuModel,
        totalMem,
      ].join("|");
    } else {
      rawData = [
        hostname,
        username,
        platform,
        arch,
        release,
        cpuModel,
        totalMem,
        "NO_MAC",
      ].join("|");
    }

    cachedDeviceId = crypto.createHash("sha256").update(rawData).digest("hex");
    return cachedDeviceId;
  } catch (error) {
    console.error("Error generating Device ID:", error);
    const fallback = `${os.hostname()}-${os.userInfo().username}`;
    cachedDeviceId = crypto.createHash("sha256").update(fallback).digest("hex");
    return cachedDeviceId;
  }
}

// ===== ⭐ TẠO MENU VỚI DEVICE ID TRÊN MENU BAR =====
function createMenu() {
  const deviceId = getDeviceId();
  const shortId = deviceId.substring(0, 16) + "...";

  const menu = Menu.buildFromTemplate([
    {
      label: "HAB Creative",
      submenu: [
        {
          label: `Device ID: ${shortId}`,
          click: () => {
            // ⭐ Dùng clipboard module thay vì mainWindow.webContents.copy
            clipboard.writeText(deviceId);
            dialog.showMessageBox(mainWindow, {
              type: "info",
              title: "Đã sao chép",
              message: "Device ID đã được sao chép vào clipboard!",
              buttons: ["OK"],
            });
          },
        },
        { type: "separator" },
        {
          label: "Copy Device ID",
          accelerator: "CmdOrCtrl+I",
          click: () => {
            // ⭐ Dùng clipboard module thay vì mainWindow.webContents.copy
            clipboard.writeText(deviceId);
            dialog.showMessageBox(mainWindow, {
              type: "info",
              title: "Đã sao chép",
              message: "Device ID đã được sao chép vào clipboard!",
              buttons: ["OK"],
            });
          },
        },
        { type: "separator" },
        {
          label: "Quit",
          accelerator: "CmdOrCtrl+Q",
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
  ]);

  Menu.setApplicationMenu(menu);
}

// ===== ⭐ LOADING MỞ APP - FULL MÀN HÌNH =====
function showAppLoadingWindow() {
  if (loadingWindow) {
    loadingWindow.show();
    return;
  }

  loadingWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    frame: false,
    transparent: false,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  loadingWindow.loadFile(path.join(__dirname, "loading.html"));

  const { width, height } =
    require("electron").screen.getPrimaryDisplay().workAreaSize;
  loadingWindow.setBounds({
    x: (width - 1400) / 2,
    y: (height - 900) / 2,
    width: 1400,
    height: 900,
  });

  loadingWindow.on("closed", () => {
    loadingWindow = null;
  });
}

function hideAppLoadingWindow() {
  if (loadingWindow) {
    loadingWindow.webContents
      .executeJavaScript(
        `
      document.body.style.transition = 'opacity 0.5s';
      document.body.style.opacity = '0';
    `,
      )
      .then(() => {
        setTimeout(() => {
          if (loadingWindow) {
            loadingWindow.close();
            loadingWindow = null;
          }
        }, 500);
      })
      .catch(() => {
        if (loadingWindow) {
          loadingWindow.close();
          loadingWindow = null;
        }
      });
  }
}

// ===== ⭐ LOADING LOGIN - FULL MÀN HÌNH =====
function showLoginLoading() {
  if (loginLoadingWindow) {
    loginLoadingWindow.show();
    return;
  }

  loginLoadingWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    frame: false,
    transparent: false,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const loginLoadingHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Đang đăng nhập...</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
          background: #0a0e1a;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          overflow: hidden;
          user-select: none;
        }
        
        .container {
          text-align: center;
          padding: 20px;
          animation: fadeIn 0.6s ease;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        
        .logo {
          font-size: 42px;
          font-weight: 800;
          letter-spacing: 3px;
          background: linear-gradient(135deg, #e94560, #ff6b6b, #ff8e8e);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 6px;
          text-shadow: 0 0 60px rgba(233, 69, 96, 0.2);
        }
        
        .spinner-wrapper {
          margin: 0 auto 28px;
          position: relative;
          width: 50px;
          height: 50px;
        }
        
        .spinner-ring {
          position: absolute;
          inset: -8px;
          border-radius: 50%;
          border: 1px solid rgba(233, 69, 96, 0.1);
          animation: ringPulse 2s ease-in-out infinite;
        }
        
        @keyframes ringPulse {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        
        .spinner {
          width: 50px;
          height: 50px;
          border: 3px solid rgba(255, 255, 255, 0.04);
          border-top-color: #e94560;
          border-right-color: #ff6b6b;
          border-radius: 50%;
          animation: spin 0.9s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          box-shadow: 0 0 40px rgba(233, 69, 96, 0.12);
          position: relative;
          z-index: 1;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .status {
          color: #94a3b8;
          font-size: 16px;
          font-weight: 400;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
          min-height: 28px;
        }
        
        .status-dots::after {
          content: '';
          animation: dots 1.5s steps(4, end) infinite;
        }
        
        @keyframes dots {
          0% { content: ''; }
          25% { content: '.'; }
          50% { content: '..'; }
          75% { content: '...'; }
        }
        
        .status-detail {
          color: #475569;
          font-size: 13px;
          letter-spacing: 0.5px;
          min-height: 24px;
          font-weight: 300;
        }
        
        .particle {
          position: fixed;
          border-radius: 50%;
          background: rgba(233, 69, 96, 0.06);
          pointer-events: none;
          animation: float 20s infinite linear;
        }
        
        @keyframes float {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100vh) rotate(720deg); opacity: 0; }
        }
        
        .glow-dot {
          position: fixed;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }
      </style>
    </head>
    <body>
      <!-- Glow dots -->
      <div class="glow-dot" style="width:400px;height:400px;left:-100px;top:-100px;background:rgba(233,69,96,0.05);"></div>
      <div class="glow-dot" style="width:300px;height:300px;right:-80px;bottom:-80px;background:rgba(255,107,107,0.04);"></div>
      
      <!-- Particles -->
      <div class="particle" style="width:80px;height:80px;left:10%;bottom:-80px;animation-duration:25s;"></div>
      <div class="particle" style="width:40px;height:40px;left:30%;bottom:-40px;animation-duration:18s;animation-delay:2s;"></div>
      <div class="particle" style="width:60px;height:60px;left:55%;bottom:-60px;animation-duration:22s;animation-delay:4s;"></div>
      <div class="particle" style="width:30px;height:30px;left:75%;bottom:-30px;animation-duration:20s;animation-delay:1s;"></div>
      <div class="particle" style="width:50px;height:50px;left:90%;bottom:-50px;animation-duration:28s;animation-delay:3s;"></div>

      <div class="container">
        <div class="logo">HAB CREATIVE</div>

        <div class="spinner-wrapper">
          <div class="spinner-ring"></div>
          <div class="spinner"></div>
        </div>

        <div class="status" id="status">
          Đang xác thực tài khoản<span class="status-dots"></span>
        </div>
        <div class="status-detail" id="statusDetail">Vui lòng đợi trong giây lát...</div>
      </div>

      <script>
        const statusText = document.getElementById('status');
        const statusDetail = document.getElementById('statusDetail');
        
        const messages = [
          { status: 'Đang kết nối Google', detail: 'Chuyển hướng đến Google...' },
          { status: 'Đang xác thực tài khoản', detail: 'Kiểm tra thông tin...' },
          { status: 'Đang đăng nhập', detail: 'Xác nhận quyền truy cập...' },
          { status: 'Hoàn tất', detail: 'Đang mở ứng dụng...' }
        ];
        
        let currentIndex = 0;
        
        function updateStatus() {
          if (currentIndex >= messages.length) return;
          
          const msg = messages[currentIndex];
          statusText.textContent = msg.status;
          statusDetail.textContent = msg.detail;
          
          currentIndex++;
          
          if (currentIndex < messages.length) {
            const delay = Math.random() * 500 + 500;
            setTimeout(updateStatus, delay);
          }
        }
        
        setTimeout(updateStatus, 300);
      </script>
    </body>
    </html>
  `;

  loginLoadingWindow.loadURL(
    `data:text/html;charset=utf-8,${encodeURIComponent(loginLoadingHTML)}`,
  );

  const { width, height } =
    require("electron").screen.getPrimaryDisplay().workAreaSize;
  loginLoadingWindow.setBounds({
    x: (width - 1400) / 2,
    y: (height - 900) / 2,
    width: 1400,
    height: 900,
  });

  loginLoadingWindow.on("closed", () => {
    loginLoadingWindow = null;
  });
}

function hideLoginLoading() {
  if (loginLoadingWindow) {
    loginLoadingWindow.webContents
      .executeJavaScript(
        `
      document.body.style.transition = 'opacity 0.5s';
      document.body.style.opacity = '0';
    `,
      )
      .then(() => {
        setTimeout(() => {
          if (loginLoadingWindow) {
            loginLoadingWindow.close();
            loginLoadingWindow = null;
          }
        }, 500);
      })
      .catch(() => {
        if (loginLoadingWindow) {
          loginLoadingWindow.close();
          loginLoadingWindow = null;
        }
      });
  }
}

// ===== TẠO MAIN WINDOW =====
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
    },
    icon: path.join(__dirname, "assets", "icon.png"),
    title: "HAB CREATIVE",
    backgroundColor: "#f3f4f6",
    show: false,
    frame: true,
    transparent: false,
  });

  mainWindow.loadURL("https://hab-creative-portfolio.vercel.app/admin/login", {
    extraHeaders: "x-desktop-app: true\n",
  });

  // ⭐ Theo dõi navigation để hiện loading login
  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (url.includes("accounts.google.com") || url.includes("google.com")) {
      showLoginLoading();
    }
  });

  // ⭐ Khi load xong thì ẩn loading login
  mainWindow.webContents.on("did-finish-load", () => {
    hideLoginLoading();

    if (!isAppReady) {
      isAppReady = true;
      hideAppLoadingWindow();
      setTimeout(() => {
        mainWindow.show();
        mainWindow.focus();
      }, 300);
    }

    mainWindow.webContents
      .executeJavaScript(
        `
      document.documentElement.style.scrollBehavior = 'smooth';
      document.documentElement.style.transform = 'translateZ(0)';
      document.querySelectorAll('img').forEach(img => {
        img.loading = 'lazy';
        img.decoding = 'async';
      });
    `,
      )
      .catch(() => {});
  });

  mainWindow.webContents.on("did-fail-load", () => {
    hideLoginLoading();
    if (!isAppReady) {
      isAppReady = true;
      hideAppLoadingWindow();
      setTimeout(() => {
        mainWindow.show();
        mainWindow.focus();
      }, 300);
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  // ⭐ Tạo menu với Device ID
  createMenu();

  mainWindow.on("closed", () => {
    mainWindow = null;
    hideLoginLoading();
  });
}

// ===== IPC HANDLERS =====
ipcMain.handle("get-device-id", () => {
  return getDeviceId();
});

ipcMain.on("loading-ready", () => {
  if (!mainWindow) {
    createMainWindow();
  }
});

// ===== APP LIFECYCLE =====
app.whenReady().then(() => {
  showAppLoadingWindow();

  setTimeout(() => {
    if (!mainWindow) {
      // Tạo main window ẩn, đợi loading-ready
    }
  }, 500);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      isAppReady = false;
      showAppLoadingWindow();
      setTimeout(() => {
        if (!mainWindow) {
          createMainWindow();
        }
      }, 500);
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

process.on("uncaughtException", (error) => {
  console.error("Error:", error);
  hideLoginLoading();
  hideAppLoadingWindow();
});
