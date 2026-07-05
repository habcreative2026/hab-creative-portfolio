const mongoose = require("mongoose");
const crypto = require("crypto");

const licenseSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ["active", "used", "expired", "revoked"],
    default: "active",
  },
  usedBy: {
    deviceId: String,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    usedAt: Date,
    ip: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => {
      const date = new Date();
      date.setDate(date.getDate() + 30);
      return date;
    },
  },
  // 👉 THỜI HẠN SỬ DỤNG LICENSE
  licenseExpiresAt: {
    type: Date,
    required: true,
    default: () => {
      const date = new Date();
      date.setDate(date.getDate() + 30);
      return date;
    },
  },
  maxUses: {
    type: Number,
    default: 1,
  },
  usedCount: {
    type: Number,
    default: 0,
  },
  notes: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  // 👉 THÔNG TIN THIẾT BỊ
  deviceInfo: {
    name: String,
    os: String,
    version: String,
  },
});

// Tạo license key tự động
licenseSchema.statics.generateKey = function () {
  const parts = [];
  for (let i = 0; i < 4; i++) {
    parts.push(crypto.randomBytes(2).toString("hex").toUpperCase());
  }
  return parts.join("-");
};

// Kiểm tra key còn hiệu lực
licenseSchema.methods.isValid = function () {
  return (
    this.status === "active" &&
    this.expiresAt > new Date() &&
    this.usedCount < this.maxUses
  );
};

// Kiểm tra license còn hạn sử dụng
licenseSchema.methods.isLicenseValid = function () {
  if (!this.licenseExpiresAt) return true;
  return new Date() < this.licenseExpiresAt;
};

module.exports = mongoose.model("License", licenseSchema);
