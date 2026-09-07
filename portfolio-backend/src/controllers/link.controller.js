const Link = require("../models/Link");

exports.getPublicLinks = async (req, res) => {
  try {
    const list = await Link.find({});
    const formatted = {};

    list.forEach((item) => {
      formatted[item.key] = {
        url: item.url,
        label: item.label,
      };
    });

    return res.json({ success: true, data: formatted });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi lấy danh sách liên kết", error: error.message });
  }
};

exports.getAdminLinks = async (req, res) => {
  try {
    const list = await Link.find({}).sort({ category: 1, key: 1 });
    return res.json({ success: true, data: list });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi lấy danh sách link admin", error: error.message });
  }
};

exports.bulkUpdateLinks = async (req, res) => {
  try {
    const { updates } = req.body;

    if (!Array.isArray(updates)) {
      return res.status(400).json({ message: "Dữ liệu không hợp lệ." });
    }

    const bulkOps = updates.map((item) => ({
      updateOne: {
        filter: { key: item.key },
        update: {
          $set: {
            url: item.url,
            label: item.label,
          },
        },
        upsert: true,
      },
    }));

    await Link.bulkWrite(bulkOps);
    return res.json({
      success: true,
      message: "Cập nhật liên kết thành công!",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi lưu liên kết", error: error.message });
  }
};
