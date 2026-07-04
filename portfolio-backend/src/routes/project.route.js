const express = require("express");
const router = express.Router();
const projectController = require("../controllers/project.controller");
const { uploadCardProject, uploadAudio } = require("../config/cloudinary");

router.post("/upload-media", (req, res, next) => {
  const isVideo = req.query.mime === "video";
  const uploadHandler = isVideo
    ? uploadAudio.single("file")
    : uploadCardProject.single("file");

  uploadHandler(req, res, function (err) {
    if (err) {
      console.error("Cloudinary Engine Error:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Không tìm thấy tệp tin gửi lên hợp lệ!",
      });
    }
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
