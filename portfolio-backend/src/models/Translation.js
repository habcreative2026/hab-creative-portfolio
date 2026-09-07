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
  },
  { timestamps: true },
);

module.exports = mongoose.model("Translation", TranslationSchema);
