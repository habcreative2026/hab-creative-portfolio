const mongoose = require("mongoose");

const AudioResourceSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    size: { type: Number },
  },
  { timestamps: true },
);

module.exports = mongoose.model("AudioResource", AudioResourceSchema);
