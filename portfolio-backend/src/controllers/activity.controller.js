const ActivityLog = require("../models/ActivityLog");
const User = require("../models/User");

exports.getActivityLogs = async (req, res) => {
  try {
    const { limit = 50, page = 1, action } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};
    if (action) filter.action = action;

    const logs = await ActivityLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ActivityLog.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error getting activity logs:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getActivityStats = async (req, res) => {
  try {
    const stats = await ActivityLog.aggregate([
      {
        $group: {
          _id: "$action",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const total = await ActivityLog.countDocuments();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyStats = await ActivityLog.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        total,
        byAction: stats,
        daily: dailyStats,
      },
    });
  } catch (error) {
    console.error("Error getting activity stats:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.logActivity = async (userId, action, details = "", metadata = {}) => {
  try {
    const user = await User.findById(userId);
    await ActivityLog.create({
      user: {
        id: userId,
        email: user?.email || "",
        name: user?.name || "",
      },
      action,
      details,
      metadata,
    });
  } catch (error) {
    console.error("Error logging activity:", error);
  }
};

exports.logActivityHandler = async (req, res) => {
  try {
    const { action, details, metadata } = req.body;

    if (!action) {
      return res.status(400).json({
        success: false,
        message: "Action is required",
      });
    }

    const user = await User.findById(req.user.id);

    const log = await ActivityLog.create({
      user: {
        id: req.user.id,
        email: user?.email || req.user.email || "",
        name: user?.name || req.user.name || "",
      },
      action: action,
      details: details || "",
      ip:
        req.ip ||
        req.connection?.remoteAddress ||
        req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
        "unknown",
      userAgent: req.headers["user-agent"] || "unknown",
      metadata: metadata || {},
    });

    console.log(`Activity logged: ${action} - ${details}`);

    res.status(201).json({
      success: true,
      message: "Activity logged successfully",
      data: log,
    });
  } catch (error) {
    console.error("Error in logActivityHandler:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to log activity",
      error: error.message,
    });
  }
};
