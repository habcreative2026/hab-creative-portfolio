// backend/src/models/GeneratedLink.js
const mongoose = require("mongoose");

const generatedLinkSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true },
    imageUrl: { type: String, required: true },
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("GeneratedLink", generatedLinkSchema);
