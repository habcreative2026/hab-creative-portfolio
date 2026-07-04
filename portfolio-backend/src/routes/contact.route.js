const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contact.controller");
const { uploadImage } = require("../config/cloudinary");

router.get("/", contactController.getContactInfo);

router.put("/", contactController.updateContactInfo);

router.post(
  "/upload-avatar",
  uploadImage.single("avatar"),
  contactController.updateAvatar,
);

router.delete("/reset", contactController.resetContactInfo);

module.exports = router;
