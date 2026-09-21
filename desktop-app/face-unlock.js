/* ============================================================
   FACE UNLOCK — SCRIPT
   Quét 3 lần không thành → THOÁT APP (không chuyển Google)
   ============================================================ */

const video = document.getElementById("camera");
const canvas = document.getElementById("overlay");
const statusEl = document.getElementById("status");
const cameraContainer = document.getElementById("cameraContainer");
const successOverlay = document.getElementById("successOverlay");
const attemptsIndicator = document.getElementById("attemptsIndicator");
const brightnessWarning = document.getElementById("brightnessWarning");
const scanLine = document.getElementById("scanLine");
const quitBtn = document.getElementById("quitBtn");

// ⭐ Ẩn nút Google nếu có (không dùng nữa)
const googleBtn = document.getElementById("googleBtn");
if (googleBtn) {
  googleBtn.style.display = "none";
}

let storedFaces = [];
let isUnlocking = false;
let isDetecting = false;
let detectionTimeout = null;

let cachedDescriptor = null;
let lastDescriptorTime = 0;

const MATCH_THRESHOLD = 0.45;
const MAX_ATTEMPTS = 3;
const FAIL_CONFIRM_FRAMES = 8;
const NO_FACE_TIMEOUT = 6000;
const DETECT_INTERVAL = 100;
const DESCRIPTOR_INTERVAL = 300;
const BRIGHTNESS_WARNING = 50;
const BRIGHTNESS_CRITICAL = 25;
const REQUIRED_MATCH_FRAMES = 3;

let currentAttempts = 0;
let consecutiveNoMatch = 0;
let consecutiveNoFace = 0;
let consecutiveMatch = 0;
let lastFaceDetectedTime = Date.now();

function updateAttemptDots(failed) {
  const dots = attemptsIndicator.querySelectorAll(".dot");
  dots.forEach((d, i) => {
    if (i < failed) d.classList.add("failed");
    else d.classList.remove("failed");
  });
}

function updateBrightnessWarning(brightness) {
  if (!brightnessWarning) return;

  if (brightness < BRIGHTNESS_CRITICAL) {
    brightnessWarning.textContent = "Quá tối - Bật đèn";
    brightnessWarning.classList.add("on");
    cameraContainer.classList.add("warning");
  } else if (brightness < BRIGHTNESS_WARNING) {
    brightnessWarning.textContent = "Ánh sáng yếu";
    brightnessWarning.classList.add("on");
  } else {
    brightnessWarning.classList.remove("on");
    cameraContainer.classList.remove("warning");
  }
}

function showSuccess() {
  isUnlocking = true;
  cameraContainer.classList.remove("scanning");
  cameraContainer.classList.add("success");
  scanLine.classList.remove("on");
  attemptsIndicator.style.display = "none";
  successOverlay.classList.add("on");

  if (detectionTimeout) clearTimeout(detectionTimeout);

  setTimeout(() => {
    window.electronAPI.faceAuth.unlockSuccess();
  }, 400);
}

/**
 * ⭐ Đóng app khi quét 3 lần không thành
 */
function closeAppAfterFailure() {
  isUnlocking = true;

  // Đổi UI
  cameraContainer.classList.remove("scanning", "success");
  cameraContainer.classList.add("warning");
  scanLine.classList.remove("on");

  // Đổi nút
  quitBtn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
      <path d="M18 6L6 18M6 6l12 12"/>
    </svg>
    Thoát
  `;
  quitBtn.style.background = "linear-gradient(135deg, #ff453a, #cc2a20)";
  quitBtn.style.color = "#fff";
  quitBtn.style.fontWeight = "700";
  quitBtn.style.boxShadow = "0 4px 20px rgba(255, 69, 58, 0.4)";

  if (detectionTimeout) clearTimeout(detectionTimeout);
  const stream = video.srcObject;
  if (stream) stream.getTracks().forEach((t) => t.stop());

  // Đếm ngược 3-2-1 rồi thoát
  let countdown = 3;
  setFaceStatus(
    statusEl,
    `Quá nhiều lần thất bại. Thoát sau ${countdown}s...`,
    "error",
  );

  const interval = setInterval(() => {
    countdown--;
    if (countdown > 0) {
      setFaceStatus(
        statusEl,
        `Quá nhiều lần thất bại. Thoát sau ${countdown}s...`,
        "error",
      );
    } else {
      clearInterval(interval);
      console.log("[Unlock] Đóng app do quét 3 lần thất bại");
      window.electronAPI.quitApp();
    }
  }, 1000);
}

/**
 * Ghi nhận 1 lần thất bại
 */
function registerFailAttempt() {
  currentAttempts++;
  updateAttemptDots(currentAttempts);
  consecutiveNoMatch = 0;
  consecutiveNoFace = 0;
  consecutiveMatch = 0;

  cameraContainer.classList.remove("scanning");
  cameraContainer.classList.add("error");

  // ⭐ Nếu đã 3 lần → THOÁT APP
  if (currentAttempts >= MAX_ATTEMPTS) {
    closeAppAfterFailure();
    return;
  }

  setFaceStatus(
    statusEl,
    `Không khớp. Còn ${MAX_ATTEMPTS - currentAttempts} lần thử`,
    "error",
  );

  setTimeout(() => {
    cameraContainer.classList.remove("error");
    cameraContainer.classList.add("scanning");
  }, 1000);
}

async function init() {
  if (typeof faceapi === "undefined") {
    setFaceStatus(statusEl, "face-api.js chưa load", "error");
    return;
  }

  if (!window.electronAPI?.faceAuth) {
    setFaceStatus(statusEl, "electronAPI không khả dụng", "error");
    return;
  }

  try {
    setFaceStatus(statusEl, "Đang tải model...", "info");

    const [, facesResult] = await Promise.all([
      loadFaceModels(),
      window.electronAPI.faceAuth.loadAll(),
    ]);

    // ⭐ Nếu không có face nào → thoát app luôn
    if (!facesResult || !facesResult.success || !facesResult.faces) {
      setFaceStatus(statusEl, "Chưa có Face ID. Thoát ứng dụng...", "error");
      setTimeout(() => window.electronAPI.quitApp(), 1500);
      return;
    }

    storedFaces = facesResult.faces;

    if (storedFaces.length === 0) {
      setFaceStatus(statusEl, "Không có face nào. Thoát ứng dụng...", "error");
      setTimeout(() => window.electronAPI.quitApp(), 1500);
      return;
    }

    setFaceStatus(statusEl, "Đang mở camera...", "info");
    await startFaceCamera(video);

    setFaceStatus(statusEl, "Mở to 2 mắt để nhận diện", "warning");

    lastFaceDetectedTime = Date.now();

    await new Promise((r) => setTimeout(r, 150));

    startUnlockLoop();
  } catch (err) {
    setFaceStatus(statusEl, "Lỗi: " + err.message, "error");
    setTimeout(() => window.electronAPI.quitApp(), 1500);
  }
}

function startUnlockLoop() {
  const displaySize = {
    width: video.videoWidth || 640,
    height: video.videoHeight || 480,
  };

  faceapi.matchDimensions(canvas, displaySize);

  async function loop() {
    if (isUnlocking || currentAttempts >= MAX_ATTEMPTS) return;

    if (isDetecting) {
      detectionTimeout = setTimeout(loop, 30);
      return;
    }

    isDetecting = true;

    try {
      const now = performance.now();
      const brightness = calculateBrightness(video);
      updateBrightnessWarning(brightness);

      if (brightness < BRIGHTNESS_CRITICAL) {
        setFaceStatus(
          statusEl,
          "Ánh sáng quá yếu. Vui lòng bật đèn.",
          "warning",
        );
        if (Date.now() - lastFaceDetectedTime > NO_FACE_TIMEOUT) {
          registerFailAttempt();
          lastFaceDetectedTime = Date.now();
        }
        return;
      }

      const shouldUpdateDescriptor =
        !cachedDescriptor || now - lastDescriptorTime > DESCRIPTOR_INTERVAL;

      let detection;
      let currentDescriptor = null;

      if (shouldUpdateDescriptor) {
        if (brightness < BRIGHTNESS_WARNING) {
          detection = await detectFaceEnhanced(video);
        } else {
          detection = await detectFace(video);
        }
        if (detection) {
          currentDescriptor = Array.from(detection.descriptor);
          cachedDescriptor = currentDescriptor;
          lastDescriptorTime = now;
        } else {
          cachedDescriptor = null;
        }
      } else {
        detection = await detectFaceLandmarksOnly(video);
      }

      drawFaceIdStyle(canvas, detection, displaySize);

      if (!detection) {
        consecutiveNoFace++;
        consecutiveNoMatch = 0;
        consecutiveMatch = 0;
        if (consecutiveNoFace >= FAIL_CONFIRM_FRAMES) {
          if (Date.now() - lastFaceDetectedTime > NO_FACE_TIMEOUT) {
            registerFailAttempt();
            lastFaceDetectedTime = Date.now();
          }
          consecutiveNoFace = 0;
        }
        setFaceStatus(statusEl, "Đang tìm khuôn mặt...", "info");
        return;
      }

      lastFaceDetectedTime = Date.now();
      consecutiveNoFace = 0;

      const eyes = checkEyes(detection.landmarks);
      if (!eyes.ok) {
        consecutiveNoMatch = 0;
        consecutiveMatch = 0;
        let reason = "Mở to 2 mắt để nhận diện";
        if (eyes.reason === "left_closed")
          reason = "Mắt TRÁI đang nhắm - Mở to";
        else if (eyes.reason === "right_closed")
          reason = "Mắt PHẢI đang nhắm - Mở to";
        else if (eyes.reason === "both_closed")
          reason = "Mở to cả 2 mắt để nhận diện";
        setFaceStatus(statusEl, reason, "warning");
        return;
      }

      if (!currentDescriptor && cachedDescriptor) {
        currentDescriptor = cachedDescriptor;
      }

      if (!currentDescriptor) {
        setFaceStatus(statusEl, "Đang nhận diện...", "warning");
        return;
      }

      let bestMatch = -1;
      let bestDistance = Infinity;

      for (let i = 0; i < storedFaces.length; i++) {
        const person = storedFaces[i];
        if (!person) continue;

        const descList = Array.isArray(person) ? person : [person];

        let minDist = Infinity;
        for (const desc of descList) {
          if (!Array.isArray(desc) || desc.length !== 128) continue;
          const d = compareDescriptors(currentDescriptor, desc);
          if (d < minDist) minDist = d;
        }

        if (minDist < bestDistance) {
          bestDistance = minDist;
          bestMatch = i;
        }
      }

      const confidence = Math.max(0, (1 - bestDistance) * 100).toFixed(1);

      if (bestDistance < MATCH_THRESHOLD) {
        consecutiveMatch++;
        consecutiveNoMatch = 0;

        if (consecutiveMatch >= REQUIRED_MATCH_FRAMES) {
          showSuccess();
          return;
        }

        setFaceStatus(
          statusEl,
          `Đang xác minh... (${consecutiveMatch}/${REQUIRED_MATCH_FRAMES})`,
          "success",
        );
      } else {
        consecutiveMatch = 0;
        consecutiveNoMatch++;

        if (consecutiveNoMatch >= FAIL_CONFIRM_FRAMES) {
          registerFailAttempt();
          consecutiveNoMatch = 0;
          if (currentAttempts >= MAX_ATTEMPTS) return;
        }

        setFaceStatus(
          statusEl,
          `Đang nhận diện... (${confidence}%)`,
          "warning",
        );
      }
    } catch (_) {
    } finally {
      isDetecting = false;
      if (!isUnlocking && currentAttempts < MAX_ATTEMPTS) {
        detectionTimeout = setTimeout(loop, DETECT_INTERVAL);
      }
    }
  }

  loop();
}

/**
 * ⭐ Nút Thoát → đóng app luôn
 */
quitBtn.addEventListener("click", () => {
  console.log("[Unlock] Quit clicked");
  if (detectionTimeout) clearTimeout(detectionTimeout);
  const stream = video.srcObject;
  if (stream) stream.getTracks().forEach((t) => t.stop());
  window.electronAPI.quitApp();
});

window.addEventListener("beforeunload", () => {
  if (detectionTimeout) clearTimeout(detectionTimeout);
  const stream = video.srcObject;
  if (stream) stream.getTracks().forEach((t) => t.stop());
});

// ⭐ Timeout 60s → thoát app (không chuyển Google)
setTimeout(() => {
  if (!isUnlocking && currentAttempts < MAX_ATTEMPTS) {
    setFaceStatus(statusEl, "Hết thời gian. Thoát ứng dụng...", "warning");
    if (detectionTimeout) clearTimeout(detectionTimeout);
    const stream = video.srcObject;
    if (stream) stream.getTracks().forEach((t) => t.stop());
    setTimeout(() => window.electronAPI.quitApp(), 1500);
  }
}, 60000);

// ⭐ Auto init
if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", init);
} else {
  console.log("[Unlock] 🚀 DOM ready, calling init()");
  init();
}
