const ImageConfig = require("../models/ImageConfig");
const ImageResource = require("../models/ImageResource");

exports.getMarqueeLogos = async (req, res) => {
  try {
    const config = await ImageConfig.findOne({ key: "marquee_logos" }).populate(
      "activeResources",
    );
    if (!config) {
      return res.json({ success: true, data: [] });
    }
    return res.json({ success: true, data: config.activeResources || [] });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.addMarqueeLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Vui lòng chọn hình ảnh." });
    }

    const newResource = await ImageResource.create({
      url: req.file.path,
      publicId: req.file.filename,
      title: req.file.originalname,
      size: req.file.size,
    });

    const updatedConfig = await ImageConfig.findOneAndUpdate(
      { key: "marquee_logos" },
      { $push: { activeResources: newResource._id } },
      { upsert: true, new: true },
    ).populate("activeResources");

    return res.json({
      success: true,
      message: "Đã thêm ảnh vào danh mục trình chiếu!",
      data: updatedConfig.activeResources,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.removeMarqueeLogo = async (req, res) => {
  try {
    const { resourceId } = req.params;

    const updatedConfig = await ImageConfig.findOneAndUpdate(
      { key: "marquee_logos" },
      { $pull: { activeResources: resourceId } },
      { new: true },
    ).populate("activeResources");

    return res.json({
      success: true,
      message: "Đã gỡ logo thành công!",
      data: updatedConfig ? updatedConfig.activeResources : [],
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.reorderMarqueeLogos = async (req, res) => {
  try {
    const { sortedIds } = req.body;

    if (!sortedIds || !Array.isArray(sortedIds)) {
      return res
        .status(400)
        .json({ success: false, message: "Dữ liệu mảng ID không hợp lệ." });
    }

    const updatedConfig = await ImageConfig.findOneAndUpdate(
      { key: "marquee_logos" },
      { $set: { activeResources: sortedIds } },
      { new: true },
    ).populate("activeResources");

    return res.json({
      success: true,
      message: "Đã cập nhật thứ tự hiển thị mới!",
      data: updatedConfig ? updatedConfig.activeResources : [],
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
