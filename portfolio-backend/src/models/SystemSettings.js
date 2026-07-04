const mongoose = require("mongoose");

const systemSettingsSchema = new mongoose.Schema(
  {
    maintenanceMode: {
      enabled: { type: Boolean, default: false },
      message: {
        type: String,
        default: "Hệ thống đang được bảo trì. Vui lòng quay lại sau.",
      },
    },
    whitelist: {
      emails: {
        type: [String],
        default: ["buihaitrong.dev@gmail.com", "thehaters32@gmail.com"],
      },
    },
    apiKeys: {
      google: { type: String, default: "" },
      cloudinary: { type: String, default: "" },
    },
    notifications: {
      enabled: { type: Boolean, default: true },
      adminEmails: { type: [String], default: [] },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("SystemSettings", systemSettingsSchema);
