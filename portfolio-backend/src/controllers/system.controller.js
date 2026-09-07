const os = require("os");
const mongoose = require("mongoose");
const SystemSettings = require("../models/SystemSettings");
const ActivityLog = require("../models/ActivityLog");
const User = require("../models/User");
const Project = require("../models/Project");
const Contact = require("../models/Contact");
const About = require("../models/About");
const { logActivity } = require("./activity.controller");

exports.getSettings = async (req, res) => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = new SystemSettings();
      await settings.save();
    }
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    console.error("Error getting settings:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = new SystemSettings();
    }

    const { maintenanceMode, whitelist, apiKeys, notifications } = req.body;

    if (maintenanceMode !== undefined) {
      settings.maintenanceMode = {
        ...settings.maintenanceMode,
        ...maintenanceMode,
      };
      await logActivity(
        req.user.id,
        "toggle_maintenance",
        `Maintenance mode: ${maintenanceMode.enabled ? "ON" : "OFF"}`,
        { maintenanceMode },
      );
    }

    if (whitelist !== undefined) {
      settings.whitelist = whitelist;
      await logActivity(
        req.user.id,
        "update_whitelist",
        `Updated whitelist: ${whitelist.emails?.join(", ") || ""}`,
        { whitelist },
      );
    }

    if (apiKeys !== undefined) {
      settings.apiKeys = apiKeys;
      await logActivity(
        req.user.id,
        "update_api_keys",
        "Updated API keys configuration",
        { apiKeys: Object.keys(apiKeys) },
      );
    }

    if (notifications !== undefined) {
      settings.notifications = notifications;
    }

    await settings.save();

    res.status(200).json({
      success: true,
      data: settings,
      message: "Cập nhật settings thành công!",
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.backupDatabase = async (req, res) => {
  try {
    const { type = "full" } = req.query;

    const backup = {
      timestamp: new Date().toISOString(),
      type: type,
      version: "1.0",
    };

    if (type === "full" || type === "users") {
      const users = await User.find().select("-twoFactorSecret -oauthId");
      backup.users = users;
      backup.stats = { ...backup.stats, users: users.length };
    }

    if (type === "full" || type === "content") {
      const [projects, contacts, abouts] = await Promise.all([
        Project.find(),
        Contact.find(),
        About.find(),
      ]);

      backup.projects = projects;
      backup.contacts = contacts;
      backup.abouts = abouts;
      backup.stats = {
        ...backup.stats,
        projects: projects.length,
        contacts: contacts.length,
        abouts: abouts.length,
      };
    }

    if (type === "full") {
      const settings = await SystemSettings.findOne();
      const logs = await ActivityLog.find().limit(1000);
      backup.settings = settings;
      backup.recentLogs = logs;
      backup.stats = {
        ...backup.stats,
        settings: settings ? 1 : 0,
        logs: logs.length,
      };
    }

    await logActivity(
      req.user.id,
      "backup_database",
      `Database backup created (${type})`,
      { type, timestamp: backup.timestamp, stats: backup.stats },
    );

    res.status(200).json({
      success: true,
      data: backup,
      message: `Backup ${type} tạo thành công!`,
    });
  } catch (error) {
    console.error("Error backing up database:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.restoreDatabase = async (req, res) => {
  try {
    const { backup } = req.body;

    if (!backup) {
      return res.status(400).json({
        success: false,
        message: "Không có dữ liệu backup để restore.",
      });
    }

    await logActivity(
      req.user.id,
      "restore_database",
      `Database restore initiated (${backup.type || "full"})`,
      { timestamp: backup.timestamp },
    );

    const results = {};

    if (backup.users && backup.users.length > 0) {
      let restored = 0;
      for (const userData of backup.users) {
        if (userData.email === req.user.email) continue;
        await User.findOneAndUpdate(
          { email: userData.email },
          { $set: userData },
          { upsert: true, new: true },
        );
        restored++;
      }
      results.users = restored;
    }

    if (backup.projects && backup.projects.length > 0) {
      let restored = 0;
      for (const data of backup.projects) {
        await Project.findOneAndUpdate(
          { slug: data.slug },
          { $set: data },
          { upsert: true, new: true },
        );
        restored++;
      }
      results.projects = restored;
    }

    if (backup.contacts && backup.contacts.length > 0) {
      let restored = 0;
      for (const data of backup.contacts) {
        await Contact.findOneAndUpdate(
          { _id: data._id },
          { $set: data },
          { upsert: true, new: true },
        );
        restored++;
      }
      results.contacts = restored;
    }

    if (backup.abouts && backup.abouts.length > 0) {
      let restored = 0;
      for (const data of backup.abouts) {
        await About.findOneAndUpdate(
          { _id: data._id },
          { $set: data },
          { upsert: true, new: true },
        );
        restored++;
      }
      results.abouts = restored;
    }

    if (backup.settings) {
      await SystemSettings.findOneAndUpdate(
        {},
        { $set: backup.settings },
        { upsert: true, new: true },
      );
      results.settings = 1;
    }

    res.status(200).json({
      success: true,
      message: "Restore database thành công!",
      data: results,
    });
  } catch (error) {
    console.error("Error restoring database:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSystemInfo = async (req, res) => {
  try {
    const [userCount, projectCount, contactCount, aboutCount, logCount] =
      await Promise.all([
        User.countDocuments(),
        Project.countDocuments(),
        Contact.countDocuments(),
        About.countDocuments(),
        ActivityLog.countDocuments(),
      ]);

    const info = {
      nodeVersion: process.version,
      platform: os.platform(),
      memory: {
        total: (os.totalmem() / 1024 / 1024 / 1024).toFixed(2) + " GB",
        free: (os.freemem() / 1024 / 1024 / 1024).toFixed(2) + " GB",
        usage: ((1 - os.freemem() / os.totalmem()) * 100).toFixed(1) + "%",
      },
      uptime: formatUptime(os.uptime()),
      database: "MongoDB",
      databaseStatus:
        mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
      environment: process.env.NODE_ENV || "development",
      port: process.env.PORT || 5000,
      cpu: os.cpus().length + " cores",
      memoryUsage: (process.memoryUsage().rss / 1024 / 1024).toFixed(0) + " MB",
      stats: {
        users: userCount,
        projects: projectCount,
        contacts: contactCount,
        abouts: aboutCount,
        activityLogs: logCount,
      },
    };

    res.status(200).json({ success: true, data: info });
  } catch (error) {
    console.error("Error getting system info:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
