const mongoose = require("mongoose");

const AudioConfigSchema = new mongoose.Schema(
  {
    key: { type: String, default: "bg_music", unique: true },
    activeResource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AudioResource",
    },
    url: { type: String, required: true, default: "/music.mp3" },
    publicId: { type: String, default: "" },
    title: { type: String, default: "Default Music" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("AudioConfig", AudioConfigSchema);
