const express = require("express");
const router = express.Router();
const projectController = require("../controllers/project.controller");
const {
  uploadCardProject,
  uploadAudio,
  uploadVideoOverlay,
} = require("../config/cloudinary");

// router.post("/upload-media", (req, res, next) => {
//   const isVideo = req.query.mime === "video";
//   const uploadHandler = isVideo
//     ? uploadAudio.single("file")
//     : uploadCardProject.single("file");

//   uploadHandler(req, res, function (err) {
//     if (err) {
//       console.error("Cloudinary Engine Error:", err);
//       return res.status(500).json({ success: false, message: err.message });
//     }
//     if (!req.file) {
//       return res.status(400).json({
//         success: false,
//         message: "Không tìm thấy tệp tin gửi lên hợp lệ!",
//       });
//     }
//     res.status(200).json({
//       success: true,
//       url: req.file.path,
//       resource_type: isVideo ? "video" : "image",
//     });
//   });
// });

router.post("/upload-media", (req, res, next) => {
  const isVideo = req.query.mime === "video";
  const isOverlay = req.query.overlay === "true"; // ⭐ THÊM PARAM NÀY

  // ⭐ CHỌN UPLOAD HANDLER PHÙ HỢP
  let uploadHandler;
  if (isOverlay && isVideo) {
    // Video overlay
    uploadHandler = uploadVideoOverlay.single("file");
  } else if (isVideo) {
    // Video bình thường
    uploadHandler = uploadAudio.single("file");
  } else {
    // Ảnh bình thường
    uploadHandler = uploadCardProject.single("file");
  }

  uploadHandler(req, res, function (err) {
    if (err) {
      console.error("Cloudinary Engine Error:", err);
      if (err.message && err.message.includes("format")) {
        const allowedFormats = isVideo
          ? "mp4, mov, mkv, avi, webm, m4v, 3gp"
          : "jpg, jpeg, png, webp, avif, svg, gif";
        return res.status(400).json({
          success: false,
          message: `Định dạng file không được hỗ trợ. ${isVideo ? "Video" : "Ảnh"} cho phép: ${allowedFormats}`,
        });
      }
      return res.status(500).json({
        success: false,
        message: err.message || "Lỗi upload lên Cloudinary",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Không tìm thấy tệp tin gửi lên hợp lệ!",
      });
    }

    console.log("✅ Upload thành công:", req.file.path);

    res.status(200).json({
      success: true,
      url: req.file.path,
      resource_type: isVideo ? "video" : "image",
    });
  });
});

router.get("/", projectController.getAllProjects);
router.post("/", projectController.createProject);
router.put("/reorder", projectController.reorderProjects);
router.get("/:slug", projectController.getProjectBySlug);
router.put("/:id", projectController.updateProjectById);
router.delete("/:id", projectController.deleteProjectById);

module.exports = router;
