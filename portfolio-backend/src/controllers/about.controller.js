const About = require("../models/About");

exports.getAboutInfo = async (req, res) => {
  try {
    let about = await About.findOne();
    if (!about) {
      about = new About();
      await about.save();
    }
    res.status(200).json({ success: true, data: about });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateAboutInfo = async (req, res) => {
  try {
    let about = await About.findOne();

    if (!about) {
      about = new About(req.body);
      await about.save();
    } else {
      Object.keys(req.body).forEach((key) => {
        if (req.body[key] !== undefined && req.body[key] !== null) {
          about[key] = req.body[key];
        }
      });
      await about.save();
    }

    res.status(200).json({ success: true, data: about });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateHeaderImage = async (req, res) => {
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
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.resetAboutInfo = async (req, res) => {
  try {
    await About.deleteMany({});
    const about = new About();
    await about.save();
    res.status(200).json({
      success: true,
      data: about,
      message: "Reset về mặc định thành công!",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
