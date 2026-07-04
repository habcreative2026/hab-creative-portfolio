const mongoose = require("mongoose");

const TypographySchema = new mongoose.Schema(
  {
    font: { type: String, default: "Inter" },
    size: { type: Number, default: 16 },
    weight: { type: String, default: "400" },
    color: { type: String, default: "#111111" },
    align: { type: String, enum: ["left", "center", "right"], default: "left" },
    letter_spacing: { type: Number, default: 0 },
  },
  { _id: false },
);

const MultiLangSchema = new mongoose.Schema(
  {
    vi: { type: String, default: "" },
    en: { type: String, default: "" },
    de: { type: String, default: "" },
  },
  { _id: false },
);

const MediaBlockSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: {
    type: String,
    enum: ["image", "video", "iframe", "text_block"],
    required: true,
  },
  src: { type: String, default: "" },
  text_content: {
    type: MultiLangSchema,
    default: () => ({ vi: "", en: "", de: "" }),
  },
  text_font: { type: String, default: "Inter" },
  text_size: { type: Number, default: 24 },
  text_weight: { type: String, default: "400" },
  text_color: { type: String, default: "#ffffff" },
  text_align: {
    type: String,
    enum: ["left", "center", "right"],
    default: "center",
  },
  text_letter_spacing: { type: Number, default: 0 },

  text_x: { type: Number, default: 50 },
  text_y: { type: Number, default: 50 },

  width_percent: { type: Number, default: 100 },
  height_px: { type: Number, default: 450 },
  align_block: {
    type: String,
    enum: ["left", "center", "right"],
    default: "center",
  },
  sort_order: { type: Number, required: true },
  has_text_overlay: { type: Boolean, default: false },
});

const ProjectSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    style_title: {
      type: TypographySchema,
      default: () => ({
        font: "Inter",
        size: 32,
        weight: "700",
        color: "#111111",
        align: "left",
        letter_spacing: 0,
      }),
    },
    style_company: {
      type: TypographySchema,
      default: () => ({
        font: "Inter",
        size: 14,
        weight: "600",
        color: "#a3a3a3",
        align: "left",
        letter_spacing: 1,
      }),
    },
    style_year: {
      type: TypographySchema,
      default: () => ({
        font: "Inter",
        size: 14,
        weight: "600",
        color: "#111111",
        align: "left",
        letter_spacing: 0,
      }),
    },
    style_category: {
      type: TypographySchema,
      default: () => ({
        font: "Inter",
        size: 14,
        weight: "600",
        color: "#111111",
        align: "left",
        letter_spacing: 0,
      }),
    },
    style_description: {
      type: TypographySchema,
      default: () => ({
        font: "Inter",
        size: 18,
        weight: "400",
        color: "#171717",
        align: "left",
        letter_spacing: 0,
      }),
    },
    style_live: {
      type: TypographySchema,
      default: () => ({
        font: "Inter",
        size: 14,
        weight: "600",
        color: "#2563eb",
        align: "left",
        letter_spacing: 0,
      }),
    },
    style_company_value: {
      font: { type: String, default: "Inter" },
      size: { type: Number, default: 14 },
      weight: { type: String, default: "400" },
      color: { type: String, default: "#a3a3a3" },
      letter_spacing: { type: Number, default: 0 },
    },
    style_year_value: {
      font: { type: String, default: "Inter" },
      size: { type: Number, default: 14 },
      weight: { type: String, default: "400" },
      color: { type: String, default: "#ffffff" },
      letter_spacing: { type: Number, default: 0 },
    },
    style_category_value: {
      font: { type: String, default: "Inter" },
      size: { type: Number, default: 14 },
      weight: { type: String, default: "400" },
      color: { type: String, default: "#ffffff" },
      letter_spacing: { type: Number, default: 0 },
    },
    style_live_value: {
      font: { type: String, default: "Inter" },
      size: { type: Number, default: 14 },
      weight: { type: String, default: "400" },
      color: { type: String, default: "#3b82f6" },
      letter_spacing: { type: Number, default: 0 },
    },
    company: { type: String, default: "" },
    year: { type: String, default: "" },
    live: {
      text: { type: String, default: "" },
      url: { type: String, default: "" },
      label: {
        vi: { type: String, default: "" },
        en: { type: String, default: "" },
        de: { type: String, default: "" },
      },
    },
    category: {
      type: MultiLangSchema,
      default: () => ({ vi: "", en: "", de: "" }),
    },
    description: {
      type: MultiLangSchema,
      default: () => ({ vi: "", en: "", de: "" }),
    },
    media_blocks: [MediaBlockSchema],
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Project", ProjectSchema);
