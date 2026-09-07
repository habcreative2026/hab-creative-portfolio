const mongoose = require("mongoose");

const CardProjectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    showOnHome: { type: Boolean, default: false },
    showOnProjects: { type: Boolean, default: false },
    client: { type: String, trim: true, default: "" },
    homeImage: { type: String, default: "" },
    projectsPageImage: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("CardProject", CardProjectSchema);
