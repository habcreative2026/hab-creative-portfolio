const mongoose = require("mongoose");

const TranslationSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    vi: { type: String, default: "" },
    en: { type: String, default: "" },
    de: { type: String, default: "" },
    category: { type: String, default: "Bùi Hải Trọng" },

    // 🆕 Text Style cho key này
    style: {
      fontFamily: { type: String, default: "" }, // empty = không override
      fontWeight: { type: Number, default: 0 }, // 0 = không override
      fontSize: { type: Number, default: 0 }, // 0 = không override
      letterSpacing: { type: Number, default: 0 }, // 0 = không override
      color: { type: String, default: "" }, // empty = không override
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Translation", TranslationSchema);
