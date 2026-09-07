const mongoose = require("mongoose");

const VideoResourceSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    size: { type: Number },
  },
  { timestamps: true },
);

module.exports = mongoose.model("VideoResource", VideoResourceSchema);
