// ⭐ DYNAMIC PATH — hoạt động cả 3 OS
let FACE_MODEL_URL = "./models/";
let _pathInitialized = false;
let _pathInitPromise = null;

async function initModelPath() {
  if (_pathInitialized) return FACE_MODEL_URL;
  if (_pathInitPromise) return _pathInitPromise;

  _pathInitPromise = (async () => {
    try {
      if (window.electronAPI?.getModelsPath) {
        FACE_MODEL_URL = await window.electronAPI.getModelsPath();
        console.log("✅ [Face] Model URL resolved:", FACE_MODEL_URL);
      } else {
        console.warn("⚠️ [Face] electronAPI not available");
      }
    } catch (err) {
      console.error("❌ [Face] Cannot get model path:", err);
    } finally {
      _pathInitialized = true;
    }
    return FACE_MODEL_URL;
  })();

  return _pathInitPromise;
}

// ⭐ DETECTOR_OPTIONS — KHÔNG khởi tạo ngay
let DETECTOR_OPTIONS = null;

const EYE_OPEN_THRESHOLD = 0.18;

let _brightnessCanvas = null;
let _enhanceCanvas = null;
let _modelsLoaded = false;
let _modelLoadPromise = null;

// ⭐ SETUP TFJS BACKEND
async function setupTFJSBackend() {
  if (typeof tf === "undefined") {
    console.warn("[TFJS] tf undefined");
    return;
  }

  try {
    const preferred = ["webgl", "cpu"];

    for (const backend of preferred) {
      try {
        console.log(`[TFJS] Trying backend: ${backend}`);

        const result = await Promise.race([
          (async () => {
            await tf.setBackend(backend);
            await tf.ready();
            return true;
          })(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), 5000),
          ),
        ]);

        if (result) {
          console.log(`[TFJS] ✅ Backend: ${backend}`);
          return;
        }
      } catch (err) {
        console.warn(`[TFJS] ⚠️ Backend ${backend} failed:`, err.message);
      }
    }

    console.error("[TFJS] ❌ All backends failed");
  } catch (err) {
    console.error("[TFJS] ❌ setupTFJSBackend error:", err);
  }
}

// ⭐ LOAD MODELS
async function loadFaceModels() {
  if (_modelLoadPromise) return _modelLoadPromise;
  if (_modelsLoaded) return;

  _modelLoadPromise = (async () => {
    console.time("[Face] Load models");

    try {
      console.log("[Face] Step 1: Resolve model path...");
      await initModelPath();
      console.log("[Face] ✅ Step 1 done. URL:", FACE_MODEL_URL);

      console.log("[Face] Step 2: Setup TFJS backend...");
      await setupTFJSBackend();
      console.log("[Face] ✅ Step 2 done.");

      if (typeof faceapi === "undefined") {
        throw new Error("faceapi is undefined");
      }

      if (!DETECTOR_OPTIONS) {
        DETECTOR_OPTIONS = new faceapi.TinyFaceDetectorOptions({
          inputSize: 320,
          scoreThreshold: 0.5,
        });
        console.log("[Face] ✅ Detector options initialized");
      }

      console.log("[Face] Step 5: Load models from:", FACE_MODEL_URL);

      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(FACE_MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(FACE_MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(FACE_MODEL_URL),
      ]);
      console.log("[Face] ✅ Step 5 done. All models loaded.");

      try {
        const c = document.createElement("canvas");
        c.width = 320;
        c.height = 240;
        const ctx = c.getContext("2d");
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, c.width, c.height);
        await faceapi.detectSingleFace(c, DETECTOR_OPTIONS);
        console.log("[Face] ✅ Step 6 done. Warm-up complete.");
      } catch (err) {
        console.warn("[Face] ⚠️ Warm-up failed:", err);
      }

      _modelsLoaded = true;
      console.timeEnd("[Face] Load models");
      console.log("✅ [Face] Models loaded & cached");
    } catch (err) {
      console.error("[Face] ❌ loadFaceModels failed:", err);
      _modelLoadPromise = null;
      throw err;
    }
  })();

  return _modelLoadPromise;
}

// ⭐ START CAMERA
async function startFaceCamera(videoElement) {
  console.log("[Face] Starting camera...");

  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      width: { ideal: 480, min: 320 },
      height: { ideal: 360, min: 240 },
      facingMode: "user",
      frameRate: { ideal: 24, max: 30 },
    },
    audio: false,
  });

  videoElement.srcObject = stream;
  videoElement.setAttribute("playsinline", "");
  videoElement.muted = true;

  await new Promise((resolve) => {
    if (videoElement.readyState >= 2) return resolve();
    videoElement.onloadedmetadata = () => {
      videoElement.play().catch(() => {});
      resolve();
    };
  });

  console.log("[Face] ✅ Camera started");
  return stream;
}

// ⭐ DETECT
async function detectFace(videoElement) {
  return faceapi
    .detectSingleFace(videoElement, DETECTOR_OPTIONS)
    .withFaceLandmarks()
    .withFaceDescriptor();
}

async function detectFaceLandmarksOnly(videoElement) {
  return faceapi
    .detectSingleFace(videoElement, DETECTOR_OPTIONS)
    .withFaceLandmarks();
}

async function detectFaceEnhanced(videoElement) {
  if (!_enhanceCanvas) {
    _enhanceCanvas = document.createElement("canvas");
  }
  const c = _enhanceCanvas;
  c.width = videoElement.videoWidth || 480;
  c.height = videoElement.videoHeight || 360;

  const ctx = c.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(videoElement, 0, 0, c.width, c.height);

  const img = ctx.getImageData(0, 0, c.width, c.height);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    d[i] = Math.min(255, d[i] * 1.4);
    d[i + 1] = Math.min(255, d[i + 1] * 1.4);
    d[i + 2] = Math.min(255, d[i + 2] * 1.4);
  }
  ctx.putImageData(img, 0, 0);

  return faceapi
    .detectSingleFace(c, DETECTOR_OPTIONS)
    .withFaceLandmarks()
    .withFaceDescriptor();
}

function calculateBrightness(videoElement) {
  if (!_brightnessCanvas) {
    _brightnessCanvas = document.createElement("canvas");
    _brightnessCanvas.width = 48;
    _brightnessCanvas.height = 36;
  }
  const c = _brightnessCanvas;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(videoElement, 0, 0, c.width, c.height);

  const img = ctx.getImageData(0, 0, c.width, c.height);
  const d = img.data;
  let total = 0;
  for (let i = 0; i < d.length; i += 4) {
    total += 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
  }
  return total / (d.length / 4);
}

function checkEyes(landmarks) {
  if (!landmarks || !landmarks.positions) {
    return { ok: false, reason: "no_landmarks" };
  }

  try {
    const p = landmarks.positions;
    const leftEye = p.slice(36, 42);
    const rightEye = p.slice(42, 48);

    const ear = (eye) => {
      const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
      const v1 = dist(eye[1], eye[5]);
      const v2 = dist(eye[2], eye[4]);
      const h = dist(eye[0], eye[3]);
      return h === 0 ? 0 : (v1 + v2) / (2 * h);
    };

    const lEAR = ear(leftEye);
    const rEAR = ear(rightEye);
    const lOpen = lEAR > EYE_OPEN_THRESHOLD;
    const rOpen = rEAR > EYE_OPEN_THRESHOLD;

    if (!lOpen && !rOpen) return { ok: false, reason: "both_closed" };
    if (!lOpen) return { ok: false, reason: "left_closed" };
    if (!rOpen) return { ok: false, reason: "right_closed" };
    return { ok: true, leftEAR: lEAR, rightEAR: rEAR };
  } catch (_) {
    return { ok: false, reason: "error" };
  }
}

function drawFaceIdStyle(canvas, detection, displaySize) {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!detection) return;

  const resized = faceapi.resizeResults(detection, displaySize);
  const box = resized.detection.box;
  const score = resized.detection.score;
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  const r = Math.max(box.width, box.height) / 2 + 12;

  const color = score > 0.75 ? "#30d158" : "#0a84ff";

  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  const len = 18;
  const off = 5;
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.moveTo(cx - r - off, cy - r + len);
  ctx.lineTo(cx - r - off, cy - r - off);
  ctx.lineTo(cx - r + len, cy - r - off);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx + r - len, cy - r - off);
  ctx.lineTo(cx + r + off, cy - r - off);
  ctx.lineTo(cx + r + off, cy - r + len);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx - r - off, cy + r - len);
  ctx.lineTo(cx - r - off, cy + r + off);
  ctx.lineTo(cx - r + len, cy + r + off);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx + r - len, cy + r + off);
  ctx.lineTo(cx + r + off, cy + r + off);
  ctx.lineTo(cx + r + off, cy + r - len);
  ctx.stroke();
}

function compareDescriptors(d1, d2) {
  return faceapi.euclideanDistance(new Float32Array(d1), new Float32Array(d2));
}

function setFaceStatus(el, text, type = "info") {
  if (!el) return;
  el.textContent = text;
  el.className = el.className
    .replace(/\b(info|error|success|warning)\b/g, "")
    .trim();
  el.classList.add(type);
}
