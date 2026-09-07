const mongoose = require("mongoose");

const ImageResourceSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("ImageResource", ImageResourceSchema);
