const mongoose = require("mongoose");

const ImageConfigSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },

    activeResource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ImageResource",
    },
    activeResources: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ImageResource",
      },
    ],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("ImageConfig", ImageConfigSchema);
