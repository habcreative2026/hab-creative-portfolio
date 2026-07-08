// backend/models/Logo.js
const mongoose = require("mongoose");

const LogoSchema = new mongoose.Schema(
  {
    logo_image: {
      type: String,
      default: "/logo_bhq.png",
    },
    logo_alt: {
      type: String,
      default: "Logo",
    },
    logo_link: {
      type: String,
      default: "/",
    },
    logo_width: {
      type: Number,
      default: 120,
    },
    logo_height: {
      type: Number,
      default: 32,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Logo", LogoSchema);
