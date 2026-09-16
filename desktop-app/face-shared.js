// ===================== FACE SHARED UTILITIES =====================

const FACE_MODEL_URL = "./models";

// Cache options
let cachedDetectorOptions = null;

function getDetectorOptions() {
  if (!cachedDetectorOptions) {
    cachedDetectorOptions = new faceapi.TinyFaceDetectorOptions({
      inputSize: 320,
      scoreThreshold: 0.3,
    });
    console.log("[Face Shared] Detector options cached");
  }
  return cachedDetectorOptions;
}

// ===================== FIX CANVAS BUG =====================
(function fixCanvasForFaceApi() {
  try {
    const originalCreateElement = document.createElement.bind(document);
    document.createElement = function (tagName, options) {
      const element = originalCreateElement(tagName, options);
      if (typeof tagName === "string" && tagName.toLowerCase() === "canvas") {
        if (!(element instanceof HTMLCanvasElement)) {
          Object.setPrototypeOf(element, HTMLCanvasElement.prototype);
        }
      }
      return element;
    };
    console.log("[Face Shared] Canvas override applied");
  } catch (err) {
    console.error("[Face Shared] Canvas override failed:", err);
  }
})();

// ===================== SETUP BACKEND =====================
async function setupTFJSBackend() {
  try {
    if (typeof tf === "undefined") return;

    const backends = ["webgl", "cpu"];
    for (const backend of backends) {
      try {
        await tf.setBackend(backend);
        await tf.ready();
        console.log(`[Face Shared] ✅ TFJS backend: ${tf.getBackend()}`);
        return;
      } catch (err) {
        console.warn(`[Face Shared] Backend ${backend} failed:`, err.message);
      }
    }
  } catch (err) {
    console.error("[Face Shared] Setup backend error:", err);
  }
}

// ===================== LOAD MODELS =====================
async function loadFaceModels() {
  console.log("[Face Shared] Loading models...");

  await setupTFJSBackend();

  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(FACE_MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(FACE_MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(FACE_MODEL_URL),
  ]);

  console.log("[Face Shared] ✅ Models loaded");

  // Warm-up
  try {
    const warmupCanvas = document.createElement("canvas");
    warmupCanvas.width = 320;
    warmupCanvas.height = 240;
    const ctx = warmupCanvas.getContext("2d");
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, 320, 240);

    const start = performance.now();
    await faceapi.detectSingleFace(warmupCanvas, getDetectorOptions());
    const warmupTime = performance.now() - start;
    console.log(`[Face Shared] ⚡ Warm-up: ${warmupTime.toFixed(0)}ms`);
  } catch (err) {
    console.warn("[Face Shared] Warm-up failed:", err.message);
  }
}

// ===================== START CAMERA =====================
async function startFaceCamera(videoElement) {
  console.log("[Face Shared] Starting camera...");
  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      width: { ideal: 640 },
      height: { ideal: 480 },
      facingMode: "user",
      frameRate: { ideal: 30 },
    },
    audio: false,
  });

  videoElement.srcObject = stream;

  await new Promise((resolve) => {
    videoElement.onloadedmetadata = () => {
      videoElement.play();
      resolve();
    };
  });

  console.log(
    "[Face Shared] ✅ Camera:",
    videoElement.videoWidth,
    "x",
    videoElement.videoHeight,
  );
  return stream;
}

// ===================== DETECT FULL =====================
async function detectFace(videoElement) {
  return await faceapi
    .detectSingleFace(videoElement, getDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();
}

// ===================== DETECT LANDMARKS ONLY =====================
async function detectFaceLandmarksOnly(videoElement) {
  return await faceapi
    .detectSingleFace(videoElement, getDetectorOptions())
    .withFaceLandmarks();
}

// ===================== 🆕 DETECT ENHANCED =====================
async function detectFaceEnhanced(videoElement) {
  if (!window.__enhanceCanvas) {
    window.__enhanceCanvas = document.createElement("canvas");
  }

  const enhanceCanvas = window.__enhanceCanvas;
  enhanceCanvas.width = videoElement.videoWidth || 640;
  enhanceCanvas.height = videoElement.videoHeight || 480;

  const ctx = enhanceCanvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(videoElement, 0, 0, enhanceCanvas.width, enhanceCanvas.height);

  // Enhance
  const imageData = ctx.getImageData(
    0,
    0,
    enhanceCanvas.width,
    enhanceCanvas.height,
  );
  const data = imageData.data;
  const brightness = 1.5;

  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, data[i] * brightness);
    data[i + 1] = Math.min(255, data[i + 1] * brightness);
    data[i + 2] = Math.min(255, data[i + 2] * brightness);
  }

  ctx.putImageData(imageData, 0, 0);

  return await faceapi
    .detectSingleFace(enhanceCanvas, getDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();
}

// ===================== CALCULATE BRIGHTNESS =====================
function calculateBrightness(videoElement) {
  if (!window.__brightnessCanvas) {
    window.__brightnessCanvas = document.createElement("canvas");
    window.__brightnessCanvas.width = 80; // ⬇️ Nhỏ hơn nữa cho nhanh
    window.__brightnessCanvas.height = 60;
  }

  const canvas = window.__brightnessCanvas;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  let totalBrightness = 0;
  const pixelCount = data.length / 4;

  for (let i = 0; i < data.length; i += 4) {
    totalBrightness +=
      0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }

  return totalBrightness / pixelCount;
}

// ===================== DRAW FACE ID STYLE =====================
function drawFaceIdStyle(canvas, detection, displaySize) {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!detection) return;

  const resized = faceapi.resizeResults(detection, displaySize);
  const box = resized.detection.box;
  const score = resized.detection.score;

  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;
  const radius = Math.max(box.width, box.height) / 2 + 15;

  const color =
    score > 0.8 ? "rgba(16, 185, 129, 0.9)" : "rgba(233, 69, 96, 0.6)";

  // Vòng chính
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.stroke();

  // Vòng glow
  ctx.strokeStyle = color.replace(/[\d.]+\)$/, "0.2)");
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius + 5, 0, Math.PI * 2);
  ctx.stroke();

  // 4 góc focus
  const cornerLength = 20;
  const cornerOffset = 6;
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.moveTo(centerX - radius - cornerOffset, centerY - radius + cornerLength);
  ctx.lineTo(centerX - radius - cornerOffset, centerY - radius - cornerOffset);
  ctx.lineTo(centerX - radius + cornerLength, centerY - radius - cornerOffset);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(centerX + radius - cornerLength, centerY - radius - cornerOffset);
  ctx.lineTo(centerX + radius + cornerOffset, centerY - radius - cornerOffset);
  ctx.lineTo(centerX + radius + cornerOffset, centerY - radius + cornerLength);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(centerX - radius - cornerOffset, centerY + radius - cornerLength);
  ctx.lineTo(centerX - radius - cornerOffset, centerY + radius + cornerOffset);
  ctx.lineTo(centerX - radius + cornerLength, centerY + radius + cornerOffset);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(centerX + radius - cornerLength, centerY + radius + cornerOffset);
  ctx.lineTo(centerX + radius + cornerOffset, centerY + radius + cornerOffset);
  ctx.lineTo(centerX + radius + cornerOffset, centerY + radius - cornerLength);
  ctx.stroke();
}

// ===================== COMPARE =====================
function compareDescriptors(descriptor1, descriptor2) {
  return faceapi.euclideanDistance(
    new Float32Array(descriptor1),
    new Float32Array(descriptor2),
  );
}

// ===================== STATUS =====================
function setFaceStatus(element, text, type = "info") {
  if (!element) return;
  element.textContent = text;
  element.className = element.className.replace(
    /\b(info|error|success|warning)\b/g,
    "",
  );
  element.classList.add(type);
}
