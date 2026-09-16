// ===================== FACE UNLOCK (3-Profile, OPTIMIZED) =====================

const video = document.getElementById("camera");
const canvas = document.getElementById("overlay");
const statusEl = document.getElementById("status");
const lockIcon = document.getElementById("lockIcon");
const titleEl = document.getElementById("title");
const subtitleEl = document.getElementById("subtitle");
const cameraContainer = document.getElementById("cameraContainer");
const successOverlay = document.getElementById("successOverlay");
const googleBtn = document.getElementById("googleBtn");
const quitBtn = document.getElementById("quitBtn");
const attemptsIndicator = document.getElementById("attemptsIndicator");

let detectionInterval = null;
let detectionTimeout = null;
let storedProfiles = null;
let profileTypes = [];
let isUnlocking = false;
let isDetecting = false;

// 🆕 Descriptor cache
let cachedDescriptor = null;
let lastDescriptorTime = 0;

// 🆕 Attempt tracking (5 lần cho khớp UI)
const MATCH_THRESHOLD = 0.6;
const MAX_ATTEMPTS = 5;
const FAIL_CONFIRM_FRAMES = 8;
const NO_FACE_TIMEOUT = 5000;

let currentAttempts = 0;
let consecutiveNoMatch = 0;
let consecutiveNoFace = 0;
let lastFaceDetectedTime = Date.now();

// 🆕 Timing
const DETECT_INTERVAL = 150; // ⬆️ Tăng từ 80 → 150ms
const DESCRIPTOR_INTERVAL = 400; // ⬆️ Tăng từ 300 → 400ms

// Brightness threshold
const BRIGHTNESS_WARNING = 50;
const BRIGHTNESS_CRITICAL = 30;

// Labels
const TYPE_LABELS = {
  noMask: "Không khẩu trang",
  withMask: "Có khẩu trang",
  withGlasses: "Đeo kính",
};

// ===================== UPDATE ATTEMPT DOTS =====================
function updateAttemptDots(failedCount) {
  const dots = attemptsIndicator.querySelectorAll(".attempt-dot");
  dots.forEach((dot, i) => {
    if (i < failedCount) {
      dot.classList.add("failed");
    } else {
      dot.classList.remove("failed");
    }
  });
}

// ===================== SHOW GOOGLE FALLBACK =====================
function showGoogleFallback(reason = "") {
  googleBtn.classList.add("visible");
  subtitleEl.textContent = reason || "Hoặc đăng nhập bằng Google";
  lockIcon.style.borderColor = "#f59e0b";
}

// ===================== SHOW SUCCESS =====================
function showSuccess(matchedType) {
  lockIcon.classList.add("unlocked");
  titleEl.classList.add("unlocked");
  titleEl.textContent = "Đã mở khóa";
  subtitleEl.textContent = "Đang mở ứng dụng...";
  cameraContainer.classList.add("success");
  statusEl.textContent = `✅ Nhận diện thành công (${matchedType})`;
  statusEl.className = "status success";
  attemptsIndicator.style.display = "none";

  successOverlay.classList.add("visible");

  if (detectionInterval) clearInterval(detectionInterval);
  if (detectionTimeout) clearTimeout(detectionTimeout);

  setTimeout(() => {
    console.log("[Unlock] Sending unlock-success to main process");
    window.electronAPI.faceAuth.unlockSuccess();
  }, 400);
}

// ===================== HANDLE FAIL ATTEMPT =====================
function registerFailAttempt() {
  currentAttempts++;
  updateAttemptDots(currentAttempts);
  consecutiveNoMatch = 0;
  consecutiveNoFace = 0;

  console.log(`[Unlock] ❌ Fail attempt ${currentAttempts}/${MAX_ATTEMPTS}`);

  if (currentAttempts >= MAX_ATTEMPTS) {
    console.log("[Unlock] 🚫 Max attempts reached → showing Google fallback");
    setFaceStatus(
      statusEl,
      "❌ Đã thử quá nhiều lần. Vui lòng đăng nhập bằng Google.",
      "error",
    );
    showGoogleFallback("Đã thử quá nhiều lần, đăng nhập bằng Google");

    if (detectionInterval) clearInterval(detectionInterval);
    if (detectionTimeout) clearTimeout(detectionTimeout);

    const stream = video.srcObject;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    return;
  }

  setFaceStatus(
    statusEl,
    `❌ Không khớp. Còn ${MAX_ATTEMPTS - currentAttempts} lần thử.`,
    "error",
  );
}

// ===================== MAIN =====================
async function init() {
  console.log("[Unlock] Starting (OPTIMIZED)...");

  if (typeof faceapi === "undefined") {
    setFaceStatus(statusEl, "❌ face-api.js chưa load", "error");
    return;
  }

  if (!window.electronAPI?.faceAuth) {
    setFaceStatus(statusEl, "❌ electronAPI không khả dụng", "error");
    return;
  }

  try {
    // 🆕 Load models + camera SONG SONG
    setFaceStatus(statusEl, "Đang tải model AI...", "info");

    const [_, descriptorResult] = await Promise.all([
      loadFaceModels(),
      window.electronAPI.faceAuth.loadDescriptor(),
    ]);

    if (
      !descriptorResult ||
      !descriptorResult.success ||
      !descriptorResult.profiles
    ) {
      setFaceStatus(
        statusEl,
        "❌ Chưa có Face ID. Vui lòng đăng nhập lại.",
        "error",
      );
      showGoogleFallback("Chưa đăng ký Face ID");
      return;
    }

    storedProfiles = descriptorResult.profiles;
    profileTypes = descriptorResult.types || Object.keys(storedProfiles);

    console.log(
      "[Unlock] Loaded profiles:",
      profileTypes.join(", "),
      `(${profileTypes.length})`,
    );

    if (profileTypes.length === 0) {
      setFaceStatus(statusEl, "❌ Không có profile nào", "error");
      showGoogleFallback("Chưa đăng ký Face ID");
      return;
    }

    setFaceStatus(statusEl, "Đang mở camera...", "info");
    await startFaceCamera(video);

    setFaceStatus(statusEl, "🔍 Đang nhận diện...", "warning");

    lastFaceDetectedTime = Date.now();

    // 🆕 Warm-up detect 1 lần để camera quen
    await new Promise((resolve) => setTimeout(resolve, 200));

    startUnlockLoop();
  } catch (err) {
    console.error("[Unlock] Init error:", err);
    setFaceStatus(statusEl, "❌ Lỗi: " + err.message, "error");
    showGoogleFallback("Lỗi khởi tạo");
  }
}

// ===================== UNLOCK LOOP (OPTIMIZED) =====================
function startUnlockLoop() {
  const displaySize = {
    width: video.videoWidth,
    height: video.videoHeight,
  };

  faceapi.matchDimensions(canvas, displaySize);

  async function unlockLoop() {
    if (isUnlocking || currentAttempts >= MAX_ATTEMPTS) return;

    if (isDetecting) {
      detectionTimeout = setTimeout(unlockLoop, 50);
      return;
    }

    isDetecting = true;

    try {
      const loopStart = performance.now();
      const now = performance.now();

      // 🆕 Bước 1: Đo độ sáng (rất nhanh — canvas 160x120)
      const brightness = calculateBrightness(video);

      if (brightness < BRIGHTNESS_CRITICAL) {
        setFaceStatus(
          statusEl,
          "💡 Ánh sáng quá yếu. Vui lòng bật đèn.",
          "warning",
        );

        if (Date.now() - lastFaceDetectedTime > NO_FACE_TIMEOUT) {
          registerFailAttempt();
          lastFaceDetectedTime = Date.now();
        }
        return;
      }

      // 🆕 Bước 2: Check có cần update descriptor không
      const shouldUpdateDescriptor =
        !cachedDescriptor || now - lastDescriptorTime > DESCRIPTOR_INTERVAL;

      let detection;
      let currentDescriptor = null;

      if (shouldUpdateDescriptor) {
        // 🎯 CHỈ DETECT 1 LẦN với full pipeline
        const detectStart = performance.now();

        if (brightness < BRIGHTNESS_WARNING) {
          // Tối → dùng enhanced
          detection = await detectFaceEnhanced(video);
        } else {
          // Đủ sáng → detect trực tiếp
          detection = await detectFace(video);
        }

        const detectTime = performance.now() - detectStart;
        if (detectTime > 200) {
          console.log(`[Unlock] ⚠️ Slow detect: ${detectTime.toFixed(0)}ms`);
        }

        if (detection) {
          currentDescriptor = Array.from(detection.descriptor);
          cachedDescriptor = currentDescriptor;
          lastDescriptorTime = now;
        } else {
          cachedDescriptor = null;
        }
      } else {
        // 🚀 KHÔNG cần descriptor → chỉ detect landmarks (siêu nhanh)
        detection = await detectFaceLandmarksOnly(video);
      }

      // Vẽ UI
      drawFaceIdStyle(canvas, detection, displaySize);

      if (!detection) {
        consecutiveNoFace++;
        consecutiveNoMatch = 0;

        if (consecutiveNoFace >= FAIL_CONFIRM_FRAMES) {
          if (Date.now() - lastFaceDetectedTime > NO_FACE_TIMEOUT) {
            registerFailAttempt();
            lastFaceDetectedTime = Date.now();
          }
          consecutiveNoFace = 0;
        }

        setFaceStatus(statusEl, "🔍 Đang tìm khuôn mặt...", "info");
        return;
      }

      lastFaceDetectedTime = Date.now();
      consecutiveNoFace = 0;

      // 🆕 Bước 3: So sánh
      if (!currentDescriptor && cachedDescriptor) {
        currentDescriptor = cachedDescriptor;
      }

      if (!currentDescriptor) {
        // Chưa có descriptor → skip compare lần này
        setFaceStatus(statusEl, "🔍 Đang nhận diện...", "warning");
        return;
      }

      let bestMatch = null;
      let bestDistance = Infinity;

      for (const type of profileTypes) {
        const storedDescriptor = storedProfiles[type];
        if (!storedDescriptor) continue;

        const distance = compareDescriptors(
          currentDescriptor,
          storedDescriptor,
        );

        if (distance < bestDistance) {
          bestDistance = distance;
          bestMatch = type;
        }
      }

      const confidence = Math.max(0, (1 - bestDistance) * 100).toFixed(1);

      if (bestDistance < MATCH_THRESHOLD) {
        isUnlocking = true;
        consecutiveNoMatch = 0;

        const matchedInfo = TYPE_LABELS[bestMatch] || bestMatch;
        console.log(
          `[Unlock] ✅ MATCH! type=${bestMatch} distance=${bestDistance.toFixed(4)} confidence=${confidence}%`,
        );

        showSuccess(matchedInfo);
        return;
      } else {
        consecutiveNoMatch++;

        if (consecutiveNoMatch >= FAIL_CONFIRM_FRAMES) {
          registerFailAttempt();
          consecutiveNoMatch = 0;
          if (currentAttempts >= MAX_ATTEMPTS) return;
        }

        setFaceStatus(
          statusEl,
          `🔍 Đang nhận diện... (${confidence}%)`,
          "warning",
        );
      }

      const loopTime = performance.now() - loopStart;
      if (loopTime > 300) {
        console.log(`[Unlock] ⚠️ Slow loop: ${loopTime.toFixed(0)}ms`);
      }
    } catch (err) {
      console.error("[Unlock] Detection error:", err);
    } finally {
      isDetecting = false;
      if (!isUnlocking && currentAttempts < MAX_ATTEMPTS) {
        detectionTimeout = setTimeout(unlockLoop, DETECT_INTERVAL);
      }
    }
  }

  unlockLoop();
}

// ===================== BUTTONS =====================
googleBtn.addEventListener("click", () => {
  console.log("[Unlock] User clicked Google fallback");
  if (detectionInterval) clearInterval(detectionInterval);
  if (detectionTimeout) clearTimeout(detectionTimeout);

  const stream = video.srcObject;
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
  }

  window.electronAPI.faceAuth.fallbackToLogin();
});

quitBtn.addEventListener("click", () => {
  console.log("[Unlock] User quit app");
  if (detectionInterval) clearInterval(detectionInterval);
  if (detectionTimeout) clearTimeout(detectionTimeout);

  const stream = video.srcObject;
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
  }

  window.electronAPI.quitApp();
});

// ===================== CLEANUP =====================
window.addEventListener("beforeunload", () => {
  if (detectionInterval) clearInterval(detectionInterval);
  if (detectionTimeout) clearTimeout(detectionTimeout);
  const stream = video.srcObject;
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
  }
});

// ===================== TIMEOUT 60s =====================
setTimeout(() => {
  if (!isUnlocking && currentAttempts < MAX_ATTEMPTS) {
    console.log("[Unlock] Timeout 60s → showing fallback");
    setFaceStatus(
      statusEl,
      "⏰ Hết thời gian. Vui lòng đăng nhập bằng Google.",
      "warning",
    );
    showGoogleFallback("Hết thời gian chờ");

    if (detectionInterval) clearInterval(detectionInterval);
    if (detectionTimeout) clearTimeout(detectionTimeout);

    const stream = video.srcObject;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  }
}, 60000);

window.addEventListener("DOMContentLoaded", init);
