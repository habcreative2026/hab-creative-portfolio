const Project = require("../models/Project");
const Contact = require("../models/Contact");
const About = require("../models/About");
const User = require("../models/User");
const ActivityLog = require("../models/ActivityLog");

exports.getDashboardStats = async (req, res) => {
  try {
    const [projects, contacts, abouts, users, logs] = await Promise.all([
      Project.countDocuments(),
      Contact.countDocuments(),
      About.countDocuments(),
      User.countDocuments(),
      ActivityLog.countDocuments(),
    ]);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const projectStats = await Project.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: {
          projects,
          contacts,
          abouts,
          users,
          activityLogs: logs,
        },
        projectsByMonth: projectStats,
        recentActivities: await ActivityLog.find()
          .sort({ createdAt: -1 })
          .limit(10),
      },
    });
  } catch (error) {
    console.error("Error getting dashboard stats:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
