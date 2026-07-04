const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    oauthId: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    avatar: { type: String },
    role: {
      type: String,
      enum: ["admin", "super_admin"],
      default: "admin",
    },
    twoFactorSecret: { type: String, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
