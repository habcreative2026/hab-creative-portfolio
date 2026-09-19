const mongoose = require("mongoose");

const BroadcastSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true, // nội dung tin nhắn (HTML hoặc text)
    },
    imageUrl: {
      type: String,
      default: "", // ảnh đính kèm (URL từ Cloudinary)
    },
    recipientsCount: {
      type: Number,
      default: 0,
    },
    successCount: {
      type: Number,
      default: 0,
    },
    failedCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "sending", "success", "failed", "partial"],
      default: "pending",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Broadcast", BroadcastSchema);
