const VideoConfig = require("../models/VideoConfig");
const VideoResource = require("../models/VideoResource");
const { cloudinary } = require("../config/cloudinary");

exports.getVideoConfig = async (req, res) => {
  try {
    const config = await VideoConfig.findOne({ key: "intro_video" }).populate(
      "activeResource",
    );
    if (!config || !config.activeResource) {
      return res.json({
        success: true,
        data: { url: "/video.mp4", title: "Default Intro" },
      });
    }
    return res.json({ success: true, data: config.activeResource });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.getLibrary = async (req, res) => {
  try {
    const library = await VideoResource.find({}).sort({ createdAt: -1 });
    return res.json({ success: true, data: library });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.uploadAndActivate = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "Vui lòng chọn file video hợp lệ." });
    }

    const originalName = req.file.originalname;
    const existingResource = await VideoResource.findOne({
      title: originalName,
    });

    if (existingResource) {
      await cloudinary.uploader.destroy(req.file.filename, {
        resource_type: "video",
      });

      await VideoConfig.findOneAndUpdate(
        { key: "intro_video" },
        { activeResource: existingResource._id },
        { upsert: true },
      );

      return res.json({
        success: true,
        message: `Video "${originalName}" đã tồn tại. Hệ thống tự động tái sử dụng lại!`,
        data: existingResource,
      });
    }

    const newResource = await VideoResource.create({
      url: req.file.path,
      publicId: req.file.filename,
      title: originalName,
      size: req.file.size,
    });

    await VideoConfig.findOneAndUpdate(
      { key: "intro_video" },
      { activeResource: newResource._id },
      { upsert: true },
    );

    return res.json({
      success: true,
      message: "Upload và kích hoạt video thành công!",
      data: newResource,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi xử lý upload video", error: error.message });
  }
};

exports.selectFromLibrary = async (req, res) => {
  try {
    const { resourceId } = req.body;
    const resource = await VideoResource.findById(resourceId);
    if (!resource) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy video này trong kho." });
    }

    await VideoConfig.findOneAndUpdate(
      { key: "intro_video" },
      { activeResource: resourceId },
      { upsert: true },
    );

    return res.json({
      success: true,
      message: "Đã đổi intro sang video cũ thành công!",
      data: resource,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi hệ thống", error: error.message });
  }
};

exports.deleteFromLibrary = async (req, res) => {
  try {
    const { id } = req.params;

    const resource = await VideoResource.findById(id);
    if (!resource) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy video." });
    }

    // Kiểm tra xem video này có đang là intro active không
    const config = await VideoConfig.findOne({ key: "intro_video" });
    const isActive =
      config && String(config.activeResource) === String(resource._id);

    // Xóa file trên Cloudinary
    try {
      if (resource.publicId) {
        await cloudinary.uploader.destroy(resource.publicId, {
          resource_type: "video",
        });
      }
    } catch (cloudErr) {
      console.error("Lỗi xóa Cloudinary:", cloudErr);
      // Vẫn tiếp tục xóa DB dù Cloudinary lỗi
    }

    // Xóa record khỏi MongoDB
    await VideoResource.findByIdAndDelete(id);

    // Nếu video đang active → reset về mặc định
    if (isActive) {
      await VideoConfig.findOneAndUpdate(
        { key: "intro_video" },
        { $unset: { activeResource: "" } },
        { upsert: true },
      );
    }

    return res.json({
      success: true,
      message: isActive
        ? "Đã xóa video và chuyển intro về mặc định."
        : "Đã xóa video khỏi thư viện.",
      wasActive: isActive,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Lỗi hệ thống", error: error.message });
  }
};
