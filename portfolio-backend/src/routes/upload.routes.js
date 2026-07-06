// backend/routes/upload.routes.js
const express = require("express");
const router = express.Router();
const { uploadImage } = require("../config/cloudinary");
const About = require("../models/About");
const Contact = require("../models/Contact");

// Upload header image cho About
router.post("/image", uploadImage.single("headerImage"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Không tìm thấy file ảnh để upload!",
      });
    }

    let about = await About.findOne();
    if (!about) {
      about = new About({ header_image: req.file.path });
    } else {
      about.header_image = req.file.path;
    }
    await about.save();

    res.status(200).json({
      success: true,
      data: { header_image: about.header_image },
      message: "Cập nhật ảnh thành công!",
    });
  } catch (error) {
    console.error("Upload image error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Upload avatar cho Contact
router.post("/avatar", uploadImage.single("avatar"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Không tìm thấy file ảnh để upload!",
      });
    }

    let contact = await Contact.findOne();
    if (!contact) {
      contact = new Contact({ avatar_url: req.file.path });
    } else {
      contact.avatar_url = req.file.path;
    }
    await contact.save();

    res.status(200).json({
      success: true,
      data: { avatar_url: contact.avatar_url },
      message: "Cập nhật avatar thành công!",
    });
  } catch (error) {
    console.error("Upload avatar error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
