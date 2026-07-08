// backend/controllers/logo.controller.js
const Logo = require("../models/Logo");

exports.getLogoInfo = async (req, res) => {
  try {
    let logo = await Logo.findOne();
    if (!logo) {
      logo = new Logo();
      await logo.save();
    }
    res.status(200).json({ success: true, data: logo });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateLogoInfo = async (req, res) => {
  try {
    let logo = await Logo.findOne();

    if (!logo) {
      logo = new Logo(req.body);
      await logo.save();
    } else {
      Object.keys(req.body).forEach((key) => {
        if (req.body[key] !== undefined && req.body[key] !== null) {
          logo[key] = req.body[key];
        }
      });
      await logo.save();
    }

    res.status(200).json({ success: true, data: logo });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateLogoImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Không tìm thấy file ảnh để upload!",
      });
    }

    let logo = await Logo.findOne();

    if (!logo) {
      logo = new Logo({ logo_image: req.file.path });
    } else {
      logo.logo_image = req.file.path;
    }

    await logo.save();

    res.status(200).json({
      success: true,
      data: { logo_image: logo.logo_image },
      message: "Cập nhật logo thành công!",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.resetLogoInfo = async (req, res) => {
  try {
    await Logo.deleteMany({});
    const logo = new Logo();
    await logo.save();
    res.status(200).json({
      success: true,
      data: logo,
      message: "Reset logo về mặc định thành công!",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
