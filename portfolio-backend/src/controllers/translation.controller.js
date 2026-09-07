const Translation = require("../models/Translation");

exports.getPublicTranslations = async (req, res) => {
  try {
    const list = await Translation.find({});

    const formatted = { vi: {}, en: {}, de: {} };

    list.forEach((item) => {
      formatted.vi[item.key] = item.vi || "";
      formatted.en[item.key] = item.en || "";
      formatted.de[item.key] = item.de || "";
    });

    return res.json({ success: true, data: formatted });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi lấy dữ liệu ngôn ngữ", error: error.message });
  }
};

exports.getAdminTranslations = async (req, res) => {
  try {
    const list = await Translation.find({}).sort({ key: 1 });
    return res.json({ success: true, data: list });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi lấy danh sách", error: error.message });
  }
};

exports.bulkUpdateTranslations = async (req, res) => {
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
            vi: item.vi,
            en: item.en,
            de: item.de,
            category: item.category,
          },
        },
        upsert: true,
      },
    }));

    await Translation.bulkWrite(bulkOps);
    return res.json({
      success: true,
      message: "Cập nhật dữ liệu ngôn ngữ thành công!",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi cập nhật dữ liệu", error: error.message });
  }
};
