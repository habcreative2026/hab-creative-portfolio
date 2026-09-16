// ===================== FACE REGISTRATION (3-Profile - FAST) =====================

const video = document.getElementById("camera");
const canvas = document.getElementById("overlay");
const statusEl = document.getElementById("status");
const progressBar = document.getElementById("progressBar");
const progressLabel = document.getElementById("progressLabel");
const captureBtn = document.getElementById("captureBtn");
const cancelBtn = document.getElementById("cancelBtn");
const registerView = document.getElementById("registerView");
const successView = document.getElementById("successView");
const successTitle = document.getElementById("successTitle");
const successMessage = document.getElementById("successMessage");

// Type selector elements
const cardNoMask = document.getElementById("cardNoMask");
const cardWithMask = document.getElementById("cardWithMask");
const cardWithGlasses = document.getElementById("cardWithGlasses");
const statusNoMask = document.getElementById("statusNoMask");
const statusWithMask = document.getElementById("statusWithMask");
const statusWithGlasses = document.getElementById("statusWithGlasses");

let detectionInterval = null;
let detectionTimeout = null; // 🆕
let currentDetection = null;
let isCapturing = false;
let isDetecting = false; // 🆕 Flag chống overlap
let selectedType = "noMask";
let faceTypesInfo = {};
let registeredTypes = [];

// All types list
const ALL_TYPES = ["noMask", "withMask", "withGlasses"];

// 🆕 Timing config
const DETECT_INTERVAL = 100; // 10 FPS

// ===================== GET TYPE FROM URL QUERY =====================
function getTypeFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("type");
}

// ===================== UPDATE TYPE CARD UI =====================
function updateTypeCardUI(type, isRegistered) {
  const elementMap = {
    noMask: { card: cardNoMask, status: statusNoMask },
    withMask: { card: cardWithMask, status: statusWithMask },
    withGlasses: { card: cardWithGlasses, status: statusWithGlasses },
  };

  const mapping = elementMap[type];
  if (!mapping) {
    console.warn("[Register] Unknown type:", type);
    return;
  }

  const { card, status } = mapping;

  if (isRegistered) {
    status.textContent = "✅ Đã đăng ký";
    status.style.color = "#10b981";
  } else {
    status.textContent = "Chưa đăng ký";
    status.style.color = "#64748b";
  }

  card.classList.toggle("active", type === selectedType);
}

// ===================== SELECT TYPE =====================
function selectType(type) {
  if (isCapturing) return;

  selectedType = type;

  // Update active cho TẤT CẢ cards
  const allCards = [cardNoMask, cardWithMask, cardWithGlasses];
  allCards.forEach((card) => {
    if (!card) return;
    const cardType = card.getAttribute("data-type");
    card.classList.toggle("active", cardType === type);
  });

  const info = faceTypesInfo[type] || {};
  const isReg = registeredTypes.includes(type);

  setFaceStatus(
    statusEl,
    `${info.emoji || ""} Đang chọn: ${info.label || type}${isReg ? " (đăng ký lại)" : ""}`,
    "info",
  );

  console.log("[Register] Selected type:", type);
}

// ===================== UPDATE PROGRESS =====================
function updateProgress(percent, label) {
  progressBar.style.width = percent + "%";
  if (label) progressLabel.textContent = label;
}

// ===================== INIT =====================
async function init() {
  console.log("[Register] Starting (3-profile, FAST)...");

  if (typeof faceapi === "undefined") {
    setFaceStatus(statusEl, "❌ face-api.js chưa load", "error");
    return;
  }

  if (!window.electronAPI?.faceAuth) {
    setFaceStatus(statusEl, "❌ electronAPI.faceAuth không khả dụng", "error");
    return;
  }

  try {
    // Load types info và danh sách đã đăng ký
    faceTypesInfo = (await window.electronAPI.faceAuth.getTypesInfo()) || {};
    registeredTypes = (await window.electronAPI.faceAuth.listTypes()) || [];

    console.log("[Register] Types info:", faceTypesInfo);
    console.log("[Register] Registered types:", registeredTypes);

    // Update UI cho TẤT CẢ cards
    ALL_TYPES.forEach((type) => {
      updateTypeCardUI(type, registeredTypes.includes(type));
    });

    // Kiểm tra URL query
    const urlType = getTypeFromUrl();
    if (urlType && faceTypesInfo[urlType]) {
      selectType(urlType);
    } else {
      const firstUnregistered = ALL_TYPES.find(
        (t) => !registeredTypes.includes(t),
      );
      selectType(firstUnregistered || "noMask");
    }

    // Load models
    updateProgress(10, "Đang tải model AI...");
    setFaceStatus(statusEl, "Đang tải model AI...", "info");
    await loadFaceModels();

    // Start camera
    updateProgress(40, "Đang mở camera...");
    setFaceStatus(statusEl, "Đang mở camera...", "info");
    await startFaceCamera(video);

    // Ready
    updateProgress(100, "Sẵn sàng!");
    const info = faceTypesInfo[selectedType] || {};
    setFaceStatus(
      statusEl,
      `${info.emoji || ""} Nhìn thẳng vào camera và bấm 'Chụp khuôn mặt'`,
      "success",
    );

    captureBtn.disabled = false;
    startDetectionLoop();
  } catch (err) {
    console.error("[Register] Init error:", err);
    setFaceStatus(statusEl, "❌ Lỗi: " + err.message, "error");
  }
}

// ===================== DETECTION LOOP (FAST) =====================
function startDetectionLoop() {
  const displaySize = {
    width: video.videoWidth,
    height: video.videoHeight,
  };

  faceapi.matchDimensions(canvas, displaySize);

  // 🆕 Recursive setTimeout — tránh overlap
  async function detectLoop() {
    if (isCapturing) return;

    if (isDetecting) {
      // Skip frame nếu đang xử lý
      detectionTimeout = setTimeout(detectLoop, 30);
      return;
    }

    isDetecting = true;

    try {
      const detection = await detectFace(video);
      currentDetection = detection;

      drawDetection(canvas, detection, displaySize);

      if (detection) {
        const score = detection.detection.score;
        captureBtn.disabled = score <= 0.6; // ⬇️ Threshold 0.6
      } else {
        captureBtn.disabled = true;
      }
    } catch (err) {
      console.error("[Register] Detection error:", err);
    } finally {
      isDetecting = false;
      if (!isCapturing) {
        detectionTimeout = setTimeout(detectLoop, DETECT_INTERVAL);
      }
    }
  }

  detectLoop();
}

// ===================== CAPTURE FACE =====================
async function captureFace() {
  if (isCapturing) return;
  isCapturing = true;

  // Clear loop
  if (detectionTimeout) {
    clearTimeout(detectionTimeout);
    detectionTimeout = null;
  }
  if (detectionInterval) {
    clearInterval(detectionInterval);
    detectionInterval = null;
  }

  console.log("[Register] Capturing face for type:", selectedType);
  captureBtn.disabled = true;
  captureBtn.textContent = "Đang xử lý...";

  const info = faceTypesInfo[selectedType] || {};
  setFaceStatus(
    statusEl,
    `🔍 Đang phân tích khuôn mặt (${info.label || selectedType})...`,
    "info",
  );

  try {
    const detection = await detectFace(video);

    if (!detection) {
      throw new Error("Không phát hiện khuôn mặt");
    }

    console.log("[Register] Descriptor length:", detection.descriptor.length);

    const descriptorArray = Array.from(detection.descriptor);

    setFaceStatus(statusEl, "💾 Đang lưu dữ liệu...", "info");
    const result = await window.electronAPI.faceAuth.saveDescriptor({
      faceType: selectedType,
      descriptor: descriptorArray,
    });

    if (!result || !result.success) {
      throw new Error(result?.message || "Không lưu được descriptor");
    }

    console.log("[Register] ✅ Saved successfully");

    registeredTypes = (await window.electronAPI.faceAuth.listTypes()) || [];

    ALL_TYPES.forEach((type) => {
      updateTypeCardUI(type, registeredTypes.includes(type));
    });

    updateProgress(100, "Hoàn tất!");

    successTitle.textContent = `Đã đăng ký "${info.label || selectedType}"!`;
    successMessage.textContent = `Bạn đã đăng ký ${registeredTypes.length}/3 loại khuôn mặt`;

    const stream = video.srcObject;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    showSuccess();
  } catch (err) {
    console.error("[Register] Capture error:", err);
    setFaceStatus(statusEl, "❌ " + err.message, "error");
    captureBtn.disabled = false;
    captureBtn.textContent = "Chụp khuôn mặt";
    isCapturing = false;

    // Restart loop sau lỗi
    startDetectionLoop();
  }
}

// ===================== SHOW SUCCESS =====================
function showSuccess() {
  registerView.style.display = "none";
  successView.classList.add("visible");

  setTimeout(() => {
    window.electronAPI.faceAuth.closeFaceWindow();
  }, 2000);
}

// ===================== EVENTS =====================
captureBtn.addEventListener("click", captureFace);

cardNoMask.addEventListener("click", () => selectType("noMask"));
cardWithMask.addEventListener("click", () => selectType("withMask"));
cardWithGlasses.addEventListener("click", () => selectType("withGlasses"));

cancelBtn.addEventListener("click", () => {
  console.log("[Register] Cancelled by user");
  if (detectionInterval) clearInterval(detectionInterval);
  if (detectionTimeout) clearTimeout(detectionTimeout);

  const stream = video.srcObject;
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
  }

  window.electronAPI.faceAuth.closeFaceWindow();
});

window.addEventListener("beforeunload", () => {
  if (detectionInterval) clearInterval(detectionInterval);
  if (detectionTimeout) clearTimeout(detectionTimeout);
  const stream = video.srcObject;
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
  }
});

window.addEventListener("DOMContentLoaded", init);
