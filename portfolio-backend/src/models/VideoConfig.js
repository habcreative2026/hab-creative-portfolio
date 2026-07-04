const mongoose = require("mongoose");

const VideoConfigSchema = new mongoose.Schema(
  {
    key: { type: String, default: "intro_video", unique: true },
    activeResource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VideoResource",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("VideoConfig", VideoConfigSchema);
