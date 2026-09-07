const express = require("express");
const router = express.Router();
const audioController = require("../controllers/audio.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const { uploadAudio } = require("../config/cloudinary");

router.get("/public", audioController.getAudioConfig);
router.get("/library", authMiddleware, audioController.getLibrary);
router.post(
  "/upload",
  authMiddleware,
  uploadAudio.single("audio"),
  audioController.uploadAndActivate,
);
router.put("/select", authMiddleware, audioController.selectFromLibrary);

module.exports = router;
