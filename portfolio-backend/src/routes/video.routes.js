const express = require("express");
const router = express.Router();
const videoController = require("../controllers/video.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const { uploadAudio } = require("../config/cloudinary");

router.get("/public", videoController.getVideoConfig);
router.get("/library", authMiddleware, videoController.getLibrary);
router.post(
  "/upload",
  authMiddleware,
  uploadAudio.single("video"),
  videoController.uploadAndActivate,
);
router.put("/select", authMiddleware, videoController.selectFromLibrary);

module.exports = router;
