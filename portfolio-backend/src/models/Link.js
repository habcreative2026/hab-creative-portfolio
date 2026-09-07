const mongoose = require("mongoose");

const LinkSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    url: {
      type: String,
      required: true,
      default: "#",
    },
    label: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Link", LinkSchema);
