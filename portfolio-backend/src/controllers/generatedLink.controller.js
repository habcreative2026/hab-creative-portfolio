// backend/src/controllers/generatedLink.controller.js
const GeneratedLink = require("../models/GeneratedLink");

// Tạo slug tự động từ title hoặc timestamp
const generateSlug = (title) => {
  if (!title) return Date.now().toString(36);
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
};

// ✅ Tạo link mới
exports.createGeneratedLink = async (req, res) => {
  try {
    const { title, customSlug } = req.body;

    // uploadImage middleware đã upload lên Cloudinary
    // req.file.path chứa secure_url (từ CloudinaryStorage)
    let imageUrl = "";
    if (req.file) {
      imageUrl = req.file.path; // CloudinaryStorage trả về secure_url trong path
    }

    if (!imageUrl) {
      return res
        .status(400)
        .json({ success: false, message: "Vui lòng upload ảnh!" });
    }

    // Tạo slug
    let slug = customSlug || generateSlug(title);

    // Kiểm tra trùng slug
    const existing = await GeneratedLink.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const newLink = new GeneratedLink({
      slug,
      imageUrl,
      title,
      description: req.body.description || "",
      createdBy: req.user?._id,
    });

    await newLink.save();
    res.status(201).json({ success: true, data: newLink });
  } catch (error) {
    console.error("Create generated link error:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi tạo link", error: error.message });
  }
};

// ✅ Lấy link theo slug
exports.getGeneratedLinkBySlug = async (req, res) => {
  try {
    const link = await GeneratedLink.findOne({ slug: req.params.slug });
    if (!link) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy link" });
    }
    res.json({ success: true, data: link });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi lấy link", error: error.message });
  }
};

// ✅ Lấy tất cả links (admin)
exports.getAllGeneratedLinks = async (req, res) => {
  try {
    const links = await GeneratedLink.find().sort({ createdAt: -1 });
    res.json({ success: true, data: links });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi lấy danh sách link" });
  }
};

// ✅ Xóa link
exports.deleteGeneratedLink = async (req, res) => {
  try {
    const link = await GeneratedLink.findByIdAndDelete(req.params.id);
    if (!link) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy link" });
    }
    res.json({ success: true, message: "Đã xóa link" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi xóa link" });
  }
};
