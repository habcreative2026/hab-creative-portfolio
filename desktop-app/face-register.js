const video = document.getElementById("camera");
const canvas = document.getElementById("overlay");
const statusEl = document.getElementById("status");
const progressBar = document.getElementById("progressBar");
const captureBtn = document.getElementById("captureBtn");
const cancelBtn = document.getElementById("cancelBtn");
const registerView = document.getElementById("registerView");
const successView = document.getElementById("successView");
const successTitle = document.getElementById("successTitle");
const successMessage = document.getElementById("successMessage");
const brightnessWarning = document.getElementById("brightnessWarning");
const cameraCircle = document.getElementById("cameraCircle");
const scanLine = document.getElementById("scanLine");

let detectionTimeout = null;
let isCapturing = false;
let isDetecting = false;
let autoCaptureFired = false;

let stableFrameCount = 0;
const REQUIRED_STABLE_FRAMES = 4;
let consecutiveBadFrames = 0;
const MAX_BAD_FRAMES = 8;

const DETECT_INTERVAL = 80;
const BRIGHTNESS_WARNING = 50;
const BRIGHTNESS_CRITICAL = 25;

const REQUIRED_SAMPLES = 5;
const MIN_VALID_SAMPLES = 3;
const SAMPLE_DELAY = 250;

function updateProgress(p) {
  progressBar.style.width = p + "%";
}

function updateBrightnessWarning(brightness) {
  if (!brightnessWarning) return;
  if (brightness < BRIGHTNESS_CRITICAL) {
    brightnessWarning.textContent = "Quá tối - Cần bật đèn";
    brightnessWarning.classList.add("on");
    cameraCircle.classList.remove("scanning", "ready");
    cameraCircle.classList.add("warning");
  } else if (brightness < BRIGHTNESS_WARNING) {
    brightnessWarning.textContent = "Ánh sáng yếu";
    brightnessWarning.classList.add("on");
  } else {
    brightnessWarning.classList.remove("on");
  }
}

async function init() {
  console.log("[Register] Init started");

  if (typeof faceapi === "undefined") {
    setFaceStatus(statusEl, "face id chưa load", "error");
    return;
  }

  if (!window.electronAPI?.faceAuth) {
    setFaceStatus(statusEl, "electronAPI không khả dụng", "error");
    return;
  }

  try {
    const count = await window.electronAPI.faceAuth.count();
    const max = await window.electronAPI.faceAuth.max();

    if (count >= max) {
      setFaceStatus(
        statusEl,
        `Đã đủ ${max} khuôn mặt. Vui lòng xóa bớt.`,
        "error",
      );
      captureBtn.disabled = true;
      return;
    }

    setFaceStatus(statusEl, "Đang tải model...", "info");
    updateProgress(10);
    await loadFaceModels();

    setFaceStatus(statusEl, "Đang mở camera...", "info");
    updateProgress(40);
    await startFaceCamera(video);

    cameraCircle.classList.add("scanning");
    cameraCircle.classList.remove("warning");

    setFaceStatus(statusEl, "Nhìn thẳng vào camera", "info");
    updateProgress(60);
    captureBtn.disabled = false;

    await new Promise((r) => setTimeout(r, 500));

    startDetectionLoop();
  } catch (err) {
    console.error("[Register] Init error:", err);
    setFaceStatus(statusEl, "Lỗi: " + err.message, "error");
  }
}

function startDetectionLoop() {
  const displaySize = {
    width: video.videoWidth || 640,
    height: video.videoHeight || 480,
  };

  faceapi.matchDimensions(canvas, displaySize);

  async function loop() {
    if (isCapturing) return;

    if (isDetecting) {
      detectionTimeout = setTimeout(loop, 30);
      return;
    }
    isDetecting = true;

    try {
      const brightness = calculateBrightness(video);
      updateBrightnessWarning(brightness);

      if (brightness < BRIGHTNESS_CRITICAL) {
        setFaceStatus(statusEl, "Ánh sáng quá yếu - Bật đèn", "warning");
        stableFrameCount = 0;
        updateProgress(0);
        return;
      }

      const detection = await detectFace(video);

      drawFaceIdStyle(canvas, detection, displaySize);

      if (!detection) {
        consecutiveBadFrames++;
        if (consecutiveBadFrames > MAX_BAD_FRAMES) {
          stableFrameCount = 0;
          updateProgress(0);
        }
        cameraCircle.classList.remove("ready");
        cameraCircle.classList.add("scanning");
        setFaceStatus(statusEl, "Đang tìm khuôn mặt...", "info");
        return;
      }

      const score = detection.detection.score;

      if (score < 0.5) {
        consecutiveBadFrames++;
        if (consecutiveBadFrames > MAX_BAD_FRAMES) {
          stableFrameCount = 0;
          updateProgress(0);
        }
        setFaceStatus(statusEl, "Đang tìm khuôn mặt...", "info");
        return;
      }

      const eyes = checkEyes(detection.landmarks);

      if (!eyes.ok) {
        consecutiveBadFrames++;
        if (consecutiveBadFrames > MAX_BAD_FRAMES) {
          stableFrameCount = 0;
          updateProgress(0);
        }

        let reasonText = "Mở to cả 2 mắt để tiếp tục";
        if (eyes.reason === "left_closed")
          reasonText = "Mắt TRÁI đang nhắm/che";
        else if (eyes.reason === "right_closed")
          reasonText = "Mắt PHẢI đang nhắm/che";

        setFaceStatus(statusEl, reasonText, "warning");
        cameraCircle.classList.remove("ready");
        cameraCircle.classList.add("warning");
        return;
      }

      consecutiveBadFrames = 0;
      stableFrameCount++;

      const progressPercent = Math.min(
        100,
        (stableFrameCount / REQUIRED_STABLE_FRAMES) * 100,
      );
      updateProgress(progressPercent);

      if (stableFrameCount >= REQUIRED_STABLE_FRAMES) {
        cameraCircle.classList.remove("scanning", "warning");
        cameraCircle.classList.add("ready");
        captureBtn.disabled = false;
        setFaceStatus(
          statusEl,
          `Sẵn sàng (${(score * 100).toFixed(0)}%)`,
          "success",
        );
      } else {
        cameraCircle.classList.remove("warning");
        cameraCircle.classList.add("scanning");
        captureBtn.disabled = false;
        setFaceStatus(
          statusEl,
          `Giữ 2 mắt mở... (${progressPercent.toFixed(0)}%)`,
          "success",
        );
      }
    } catch (err) {
      console.error("[Register] Loop error:", err);
    } finally {
      isDetecting = false;
      if (!isCapturing) {
        detectionTimeout = setTimeout(loop, DETECT_INTERVAL);
      }
    }
  }

  loop();
}

async function captureFace() {
  if (isCapturing) return;

  const count = await window.electronAPI.faceAuth.count();
  const max = await window.electronAPI.faceAuth.max();

  if (count >= max) {
    setFaceStatus(statusEl, `Đã đủ ${max} khuôn mặt`, "error");
    return;
  }

  isCapturing = true;

  if (detectionTimeout) {
    clearTimeout(detectionTimeout);
    detectionTimeout = null;
  }

  captureBtn.disabled = true;
  captureBtn.textContent = "Đang xử lý...";
  scanLine.classList.remove("on");

  const descriptors = [];

  try {
    for (let i = 0; i < REQUIRED_SAMPLES; i++) {
      setFaceStatus(
        statusEl,
        `Đang lấy mẫu ${i + 1}/${REQUIRED_SAMPLES}...`,
        "info",
      );
      updateProgress(((i + 1) / REQUIRED_SAMPLES) * 100);

      await new Promise((r) => setTimeout(r, SAMPLE_DELAY));

      const det = await detectFace(video);
      if (!det) continue;

      const eyes = checkEyes(det.landmarks);
      if (!eyes.ok) continue;

      if (det.detection.score < 0.5) continue;

      descriptors.push(Array.from(det.descriptor));
    }

    if (descriptors.length < MIN_VALID_SAMPLES) {
      throw new Error(
        `Chỉ lấy được ${descriptors.length}/${REQUIRED_SAMPLES} mẫu. Vui lòng thử lại.`,
      );
    }

    setFaceStatus(statusEl, "Đang lưu dữ liệu...", "info");

    const result = await window.electronAPI.faceAuth.save({
      descriptors,
      eyesOpen: true,
    });

    if (!result || !result.success) {
      throw new Error(result?.message || "Không lưu được descriptor");
    }

    cameraCircle.classList.remove("scanning", "ready", "warning");
    cameraCircle.classList.add("success");

    successTitle.textContent = `Đã đăng ký #${result.count}`;
    successMessage.textContent = `Đã lưu ${descriptors.length} mẫu (${result.count}/${result.max})`;

    const stream = video.srcObject;
    if (stream) stream.getTracks().forEach((t) => t.stop());

    showSuccess();
  } catch (err) {
    console.error("[Register] Capture error:", err);
    setFaceStatus(statusEl, "" + err.message, "error");
    cameraCircle.classList.remove("ready", "success");
    cameraCircle.classList.add("warning");

    setTimeout(() => {
      cameraCircle.classList.remove("warning");
      cameraCircle.classList.add("scanning");
      scanLine.classList.add("on");
    }, 1200);

    isCapturing = false;
    stableFrameCount = 0;
    consecutiveBadFrames = 0;
    autoCaptureFired = false;
    captureBtn.disabled = false;
    captureBtn.textContent = "Bắt đầu quét";
    updateProgress(0);

    startDetectionLoop();
  }
}

function showSuccess() {
  registerView.style.display = "none";
  successView.classList.add("on");

  setTimeout(() => {
    window.electronAPI.faceAuth.closeFaceWindow();
  }, 2200);
}

captureBtn.addEventListener("click", () => {
  console.log("[Register] Capture button clicked");
  if (!isCapturing) captureFace();
});

cancelBtn.addEventListener("click", () => {
  console.log("[Register] Cancel clicked");

  if (detectionTimeout) clearTimeout(detectionTimeout);

  const stream = video.srcObject;
  if (stream) stream.getTracks().forEach((t) => t.stop());

  window.electronAPI.faceAuth.closeFaceWindow();
});

window.addEventListener("beforeunload", () => {
  if (detectionTimeout) clearTimeout(detectionTimeout);
  const stream = video.srcObject;
  if (stream) stream.getTracks().forEach((t) => t.stop());
});

// ⭐ Tự động gọi init() — không dùng DOMContentLoaded
// Vì script được load động sau khi DOM đã sẵn sàng
if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", init);
} else {
  console.log("[Register] 🚀 DOM ready, calling init()");
  init();
}
