// ===================== FACE ID TEST =====================
// Mục đích: Test camera + load model + phát hiện khuôn mặt

// ===================== FIX ELECTRON CANVAS BUG =====================
// Đảm bảo canvas luôn được tạo đúng cách, tránh lỗi "Illegal constructor"
(function fixCanvasForFaceApi() {
  try {
    const originalCreateElement = document.createElement.bind(document);

    document.createElement = function (tagName, options) {
      const element = originalCreateElement(tagName, options);

      if (typeof tagName === "string" && tagName.toLowerCase() === "canvas") {
        // Force prototype để đảm bảo là HTMLCanvasElement
        if (!(element instanceof HTMLCanvasElement)) {
          Object.setPrototypeOf(element, HTMLCanvasElement.prototype);
        }
      }

      return element;
    };

    console.log("[Fix] Canvas override applied");
  } catch (err) {
    console.error("[Fix] Canvas override failed:", err);
  }
})();

const MODEL_URL = "./models";
const statusEl = document.getElementById("status");
const video = document.getElementById("camera");
const canvas = document.getElementById("overlay");

let detectionInterval = null;

// Cập nhật status text
function setStatus(text, type = "info") {
  statusEl.textContent = text;
  statusEl.className = "status-bar";
  if (type === "error") statusEl.classList.add("error");
  if (type === "success") statusEl.classList.add("success");
  console.log(`[Face ID] ${text}`);
}

// ===================== 1. LOAD MODELS =====================
async function loadModels() {
  setStatus("Đang tải models AI...");

  try {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);

    console.log("[Face ID] ✅ Loaded all models");
    setStatus("✅ Models đã sẵn sàng", "success");
    return true;
  } catch (err) {
    console.error("[Face ID] ❌ Load model error:", err);
    setStatus("❌ Lỗi load model: " + err.message, "error");
    return false;
  }
}

// ===================== 2. START CAMERA =====================
async function startCamera() {
  setStatus("Đang mở camera...");

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: "user",
      },
      audio: false,
    });

    video.srcObject = stream;

    // Đợi video sẵn sàng
    await new Promise((resolve) => {
      video.onloadedmetadata = () => {
        video.play();
        resolve();
      };
    });

    console.log("[Face ID] ✅ Camera started");
    setStatus("✅ Camera đã bật", "success");
    return true;
  } catch (err) {
    console.error("[Face ID] ❌ Camera error:", err);
    setStatus("❌ Không mở được camera: " + err.message, "error");
    return false;
  }
}

// ===================== 3. DETECTION LOOP =====================
async function startDetection() {
  setStatus("🔍 Đang tìm khuôn mặt...");

  // Cấu hình canvas khớp với video
  const displaySize = {
    width: video.videoWidth,
    height: video.videoHeight,
  };

  faceapi.matchDimensions(canvas, displaySize);

  detectionInterval = setInterval(async () => {
    try {
      // Detect 1 khuôn mặt + landmarks + descriptor
      const detection = await faceapi
        .detectSingleFace(
          video,
          new faceapi.TinyFaceDetectorOptions({
            inputSize: 320,
            scoreThreshold: 0.5,
          }),
        )
        .withFaceLandmarks()
        .withFaceDescriptor();

      // Xóa canvas trước khi vẽ mới
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (detection) {
        // Resize detection theo display size
        const resized = faceapi.resizeResults(detection, displaySize);

        // Vẽ khung bao
        const box = resized.detection.box;
        ctx.strokeStyle = "#10b981";
        ctx.lineWidth = 3;
        ctx.strokeRect(box.x, box.y, box.width, box.height);

        // Vẽ landmarks
        faceapi.draw.drawFaceLandmarks(canvas, resized);

        // Vẽ label với confidence
        const score = resized.detection.score;
        ctx.fillStyle = "#10b981";
        ctx.font = "16px sans-serif";
        ctx.fillText(`Face: ${(score * 100).toFixed(1)}%`, box.x, box.y - 8);

        // Log descriptor (128 số)
        console.log(
          "[Face ID] Descriptor:",
          Array.from(detection.descriptor).slice(0, 5),
          "...",
        );

        setStatus(
          `Đã phát hiện khuôn mặt (${(score * 100).toFixed(0)}%)`,
          "success",
        );
      } else {
        setStatus("🔍 Đang tìm khuôn mặt...");
      }
    } catch (err) {
      console.error("[Face ID] Detection error:", err);
    }
  }, 200); // 5 FPS
}

// ===================== 4. MAIN =====================
async function main() {
  console.log("[Face ID] Starting...");

  // Kiểm tra có API không
  if (typeof faceapi === "undefined") {
    setStatus("❌ face-api.js chưa load", "error");
    return;
  }

  if (typeof tf === "undefined") {
    setStatus("❌ TensorFlow.js chưa load", "error");
    return;
  }

  console.log(
    "[Face ID] face-api.js version:",
    faceapi.version?.tfjsVersion || "N/A",
  );
  console.log("[Face ID] TensorFlow.js version:", tf.version.tfjs);

  // Bước 1: Load models
  const modelsOk = await loadModels();
  if (!modelsOk) return;

  // Bước 2: Start camera
  const cameraOk = await startCamera();
  if (!cameraOk) return;

  // Bước 3: Bắt đầu detect
  await startDetection();
}

// Chạy
window.addEventListener("DOMContentLoaded", main);

// Cleanup khi đóng
window.addEventListener("beforeunload", () => {
  if (detectionInterval) clearInterval(detectionInterval);
});
