const express = require("express");
const router = express.Router();
const aboutController = require("../controllers/about.controller");
const { uploadImage } = require("../config/cloudinary");
router.get("/", aboutController.getAboutInfo);

router.put("/", aboutController.updateAboutInfo);

router.post(
  "/upload-image",
  uploadImage.single("headerImage"),
  aboutController.updateHeaderImage,
);

router.delete("/reset", aboutController.resetAboutInfo);

module.exports = router;
