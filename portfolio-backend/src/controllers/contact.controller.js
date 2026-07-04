const Contact = require("../models/Contact");

exports.getContactInfo = async (req, res) => {
  try {
    let contact = await Contact.findOne();
    if (!contact) {
      contact = new Contact();
      await contact.save();
    }
    res.status(200).json({ success: true, data: contact });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateContactInfo = async (req, res) => {
  try {
    let contact = await Contact.findOne();
    if (!contact) {
      contact = new Contact(req.body);
      await contact.save();
    } else {
      Object.keys(req.body).forEach((key) => {
        if (req.body[key] !== undefined && req.body[key] !== null) {
          contact[key] = req.body[key];
        }
      });
      await contact.save();
    }
    res.status(200).json({ success: true, data: contact });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateAvatar = async (req, res) => {
  try {
    console.log("req.file:", req.file);
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
      data: {
        avatar_url: contact.avatar_url,
        ...contact.toObject(),
      },
      message: "Cập nhật avatar thành công!",
    });
  } catch (error) {
    console.error("Upload avatar error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.resetContactInfo = async (req, res) => {
  try {
    await Contact.deleteMany({});
    const contact = new Contact();
    await contact.save();
    res.status(200).json({
      success: true,
      data: contact,
      message: "Reset về mặc định thành công!",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
