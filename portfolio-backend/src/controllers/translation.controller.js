const Translation = require("../models/Translation");

// ===================== GET PUBLIC (có text + style) =====================
exports.getPublicTranslations = async (req, res) => {
  try {
    // 🆕 Chống cache
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate",
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    const list = await Translation.find({});

    // 🆕 Format: { vi, en, de, _styles }
    const formatted = {
      vi: {},
      en: {},
      de: {},
      _styles: {},
    };

    list.forEach((item) => {
      formatted.vi[item.key] = item.vi || "";
      formatted.en[item.key] = item.en || "";
      formatted.de[item.key] = item.de || "";

      // 🆕 Chỉ thêm style nếu có ít nhất 1 field
      if (item.style) {
        const hasStyle =
          item.style.fontFamily ||
          (item.style.fontWeight && item.style.fontWeight > 0) ||
          (item.style.fontSize && item.style.fontSize > 0) ||
          (item.style.letterSpacing && item.style.letterSpacing !== 0) ||
          item.style.color;

        if (hasStyle) {
          formatted._styles[item.key] = item.style;
        }
      }
    });

    return res.json({ success: true, data: formatted });
  } catch (error) {
    console.error("[Translation] getPublicTranslations error:", error);
    return res
      .status(500)
      .json({ message: "Lỗi lấy dữ liệu ngôn ngữ", error: error.message });
  }
};

// ===================== GET ADMIN LIST =====================
exports.getAdminTranslations = async (req, res) => {
  try {
    // 🆕 Chống cache
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate",
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    const list = await Translation.find({}).sort({ key: 1 });
    return res.json({ success: true, data: list });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi lấy danh sách", error: error.message });
  }
};

// ===================== BULK UPDATE =====================
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

// ===================== UPDATE STYLE cho 1 key =====================
exports.updateTranslationStyle = async (req, res) => {
  try {
    const { key } = req.params;
    const { fontFamily, fontWeight, fontSize, letterSpacing, color } = req.body;

    console.log(`[Translation] PUT style for key: "${key}"`);

    if (!key) {
      return res.status(400).json({
        success: false,
        message: "Thiếu key",
      });
    }

    const styleUpdates = {};
    if (fontFamily !== undefined) styleUpdates["style.fontFamily"] = fontFamily;
    if (fontWeight !== undefined) styleUpdates["style.fontWeight"] = fontWeight;
    if (fontSize !== undefined) styleUpdates["style.fontSize"] = fontSize;
    if (letterSpacing !== undefined)
      styleUpdates["style.letterSpacing"] = letterSpacing;
    if (color !== undefined) styleUpdates["style.color"] = color;

    if (Object.keys(styleUpdates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Không có dữ liệu để cập nhật",
      });
    }

    const translation = await Translation.findOneAndUpdate(
      { key },
      { $set: styleUpdates },
      { new: true },
    );

    if (!translation) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy key: ${key}`,
      });
    }

    console.log(`[Translation] ✅ Updated style for: ${key}`);

    return res.json({
      success: true,
      message: `Đã cập nhật style cho "${key}"`,
      data: translation,
    });
  } catch (error) {
    console.error("[Translation] updateTranslationStyle error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi cập nhật style",
      error: error.message,
    });
  }
};

// ===================== RESET STYLE cho 1 key =====================
exports.resetTranslationStyle = async (req, res) => {
  try {
    const { key } = req.params;

    const translation = await Translation.findOneAndUpdate(
      { key },
      {
        $set: {
          "style.fontFamily": "",
          "style.fontWeight": 0,
          "style.fontSize": 0,
          "style.letterSpacing": 0,
          "style.color": "",
        },
      },
      { new: true },
    );

    if (!translation) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy key: ${key}`,
      });
    }

    console.log(`[Translation] ✅ Reset style for: ${key}`);

    return res.json({
      success: true,
      message: `Đã reset style cho "${key}"`,
      data: translation,
    });
  } catch (error) {
    console.error("[Translation] resetTranslationStyle error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi reset style",
      error: error.message,
    });
  }
};
