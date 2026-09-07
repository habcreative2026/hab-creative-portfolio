const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      email: { type: String },
      name: { type: String },
    },
    action: {
      type: String,
      enum: [
        "login",
        "logout",
        "create_project",
        "update_project",
        "delete_project",
        "create_contact",
        "update_contact",
        "delete_contact",
        "create_about",
        "update_about",
        "delete_about",
        "delete_user",
        "update_user_role",
        "update_whitelist",
        "toggle_maintenance",
        "backup_database",
        "restore_database",
        "update_api_keys",
        "send_notification",
        "update_settings",
        "create_announcement",
        "update_announcement",
        "delete_announcement",
        "add_ip_blacklist",
        "remove_ip_blacklist",
        "create_api_key",
        "delete_api_key",
        "change_role",
        "toggle_scheduled_task",
        "run_scheduled_task",
        "bulk_delete_users",
        "toggle_user_status",
        "export_users",
        "view_user_detail",
        "test_action",
      ],
      required: true,
    },
    details: { type: String, default: "" },
    ip: { type: String },
    userAgent: { type: String },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

activityLogSchema.index({ "user.id": 1 });
activityLogSchema.index({ action: 1 });
activityLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model("ActivityLog", activityLogSchema);
