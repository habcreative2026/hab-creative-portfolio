const AudioConfig = require("../models/AudioConfig");
const AudioResource = require("../models/AudioResource");
const { cloudinary } = require("../config/cloudinary");

exports.getAudioConfig = async (req, res) => {
  try {
    let config = await AudioConfig.findOne({ key: "bg_music" }).populate(
      "activeResource",
    );

    if (!config) {
      return res.json({
        success: true,
        data: { url: "/music.mp3", title: "Default Music" },
      });
    }

    return res.json({
      success: true,
      data: config.activeResource || { url: "/music.mp3", title: "Default" },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.getLibrary = async (req, res) => {
  try {
    const library = await AudioResource.find({}).sort({ createdAt: -1 });
    return res.json({ success: true, data: library });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.uploadAndActivate = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Vui lòng chọn file hợp lệ." });
    }

    const originalName = req.file.originalname;

    const existingResource = await AudioResource.findOne({
      title: originalName,
    });

    if (existingResource) {
      await cloudinary.uploader.destroy(req.file.filename, {
        resource_type: "video",
      });

      await AudioConfig.findOneAndUpdate(
        { key: "bg_music" },
        { activeResource: existingResource._id },
        { upsert: true },
      );

      return res.json({
        success: true,
        message: `File "${originalName}" đã tồn tại trong lịch sử. Hệ thống tự động tái sử dụng dữ liệu cũ thành công!`,
        data: existingResource,
      });
    }

    const newResource = await AudioResource.create({
      url: req.file.path,
      publicId: req.file.filename,
      title: originalName,
      size: req.file.size,
    });

    await AudioConfig.findOneAndUpdate(
      { key: "bg_music" },
      { activeResource: newResource._id },
      { upsert: true },
    );

    return res.json({
      success: true,
      message: "Tải lên kho lưu trữ và kích hoạt nhạc nền thành công!",
      data: newResource,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi xử lý upload", error: error.message });
  }
};

exports.selectFromLibrary = async (req, res) => {
  try {
    const { resourceId } = req.body;

    const resource = await AudioResource.findById(resourceId);
    if (!resource) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy file âm thanh này trong kho." });
    }
    await AudioConfig.findOneAndUpdate(
      { key: "bg_music" },
      { activeResource: resourceId },
      { upsert: true },
    );

    return res.json({
      success: true,
      message: "Đã đổi nhạc nền sang file được chọn từ lịch sử!",
      data: resource,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi hệ thống", error: error.message });
  }
};
exports.updateAudioConfig = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "Vui lòng chọn file âm thanh hợp lệ." });
    }

    let config = await AudioConfig.findOne({ key: "bg_music" });

    if (config && config.publicId) {
      await cloudinary.uploader.destroy(config.publicId, {
        resource_type: "video",
      });
    }

    const updateData = {
      url: req.file.path,
      publicId: req.file.filename,
      title: req.file.originalname,
    };

    if (!config) {
      config = await AudioConfig.create({ key: "bg_music", ...updateData });
    } else {
      config = await AudioConfig.findOneAndUpdate(
        { key: "bg_music" },
        updateData,
        { new: true },
      );
    }

    return res.json({
      success: true,
      message: "Cập nhật file âm thanh thành công!",
      data: config,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi hệ thống khi upload audio.",
      error: error.message,
    });
  }
};
