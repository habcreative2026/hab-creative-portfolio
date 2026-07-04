const User = require("../models/User");
const ActivityLog = require("../models/ActivityLog");
const SystemSettings = require("../models/SystemSettings");
const { logActivity } = require("./activity.controller");

const OWNER_EMAIL = "buihaitrong.dev@gmail.com";

const isOwner = (email) => email.toLowerCase() === OWNER_EMAIL.toLowerCase();

exports.profile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      console.log(`[Admin Profile]: Không tìm thấy User với ID ${userId}`);
      return res
        .status(404)
        .json({ message: "Không tìm thấy tài khoản Admin hợp lệ." });
    }

    return res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        has2FA: !!user.twoFactorSecret,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Error in admin.profile:", error);
    return res.status(500).json({ message: "Đã xảy ra lỗi hệ thống." });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const { search, role, isActive, limit = 50, page = 1 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-twoFactorSecret -oauthId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      data: users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// exports.deleteUser = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (id === req.user.id) {
//       return res.status(400).json({
//         success: false,
//         message: "Bạn không thể xóa tài khoản của chính mình.",
//       });
//     }

//     const user = await User.findById(id);
//     if (!user) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Không tìm thấy user." });
//     }

//     if (user.role === "super_admin") {
//       return res.status(403).json({
//         success: false,
//         message: "Bạn không thể xóa tài khoản Super Admin khác.",
//       });
//     }

//     await User.findByIdAndDelete(id);
//     await logActivity(
//       req.user.id,
//       "delete_user",
//       `Deleted user: ${user.name} (${user.email})`,
//       { userId: id, userName: user.name },
//     );

//     return res.json({
//       success: true,
//       message: `Xóa user "${user.name}" thành công!`,
//     });
//   } catch (error) {
//     console.error("Error in deleteUser:", error);
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

// 2. SỬA hàm deleteUser
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "Bạn không thể xóa tài khoản của chính mình!",
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy user.",
      });
    }

    if (isOwner(user.email)) {
      return res.status(403).json({
        success: false,
        message: "Không thể xóa tài khoản Owner!",
      });
    }

    if (user.role === "super_admin" && !isOwner(req.user.email)) {
      return res.status(403).json({
        success: false,
        message: "Chỉ Owner mới có quyền xóa Super Admin!",
      });
    }

    await User.findByIdAndDelete(id);
    await logActivity(
      req.user.id,
      "delete_user",
      `Deleted user: ${user.name} (${user.email})`,
      { userId: id, userName: user.name },
    );

    return res.json({
      success: true,
      message: `Xóa user "${user.name}" thành công!`,
    });
  } catch (error) {
    console.error("Error in deleteUser:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.bulkDeleteUsers = async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng chọn ít nhất một user để xóa.",
      });
    }

    if (userIds.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: "Bạn không thể xóa tài khoản của chính mình.",
      });
    }

    const usersToDelete = await User.find({
      _id: { $in: userIds },
      role: { $ne: "super_admin" },
    });

    if (usersToDelete.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Không tìm thấy user nào hợp lệ để xóa.",
      });
    }

    const deletedIds = usersToDelete.map((u) => u._id);
    await User.deleteMany({ _id: { $in: deletedIds } });

    await logActivity(
      req.user.id,
      "bulk_delete_users",
      `Bulk deleted ${deletedIds.length} users`,
      { userIds: deletedIds, count: deletedIds.length },
    );

    return res.json({
      success: true,
      message: `Đã xóa ${deletedIds.length} user thành công!`,
      deletedCount: deletedIds.length,
    });
  } catch (error) {
    console.error("Error in bulkDeleteUsers:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// exports.updateUserRole = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { role } = req.body;

//     if (!["admin", "super_admin"].includes(role)) {
//       return res.status(400).json({
//         success: false,
//         message: "Role không hợp lệ. Chỉ chấp nhận 'admin' hoặc 'super_admin'.",
//       });
//     }

//     if (id === req.user.id) {
//       return res.status(400).json({
//         success: false,
//         message: "Bạn không thể thay đổi role của chính mình.",
//       });
//     }

//     const user = await User.findById(id);
//     if (!user) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Không tìm thấy user." });
//     }

//     const oldRole = user.role;
//     user.role = role;
//     await user.save();

//     await logActivity(
//       req.user.id,
//       "update_user_role",
//       `Changed role of ${user.name} from ${oldRole} to ${role}`,
//       { userId: id, oldRole, newRole: role },
//     );

//     return res.json({
//       success: true,
//       message: `Cập nhật role của "${user.name}" thành "${role}" thành công!`,
//       data: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//       },
//     });
//   } catch (error) {
//     console.error("Error in updateUserRole:", error);
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

// 1. SỬA hàm updateUserRole
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!["admin", "super_admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role không hợp lệ.",
      });
    }

    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "Bạn không thể thay đổi role của chính mình!",
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy user.",
      });
    }

    if (isOwner(user.email)) {
      return res.status(403).json({
        success: false,
        message: "Không thể thay đổi role của tài khoản Owner!",
      });
    }

    if (user.role === "super_admin" && role === "admin") {
      // Kiểm tra người thực hiện có phải Owner không
      if (!isOwner(req.user.email)) {
        return res.status(403).json({
          success: false,
          message: "Chỉ Owner mới có quyền hạ cấp Super Admin!",
        });
      }
    }

    const oldRole = user.role;
    user.role = role;
    await user.save();

    await logActivity(
      req.user.id,
      "update_user_role",
      `Changed role of ${user.email} from ${oldRole} to ${role}`,
      { userId: id, oldRole, newRole: role },
    );

    return res.json({
      success: true,
      message: `Cập nhật role thành công!`,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error in updateUserRole:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-twoFactorSecret -oauthId");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy user." });
    }

    const activities = await ActivityLog.find({ "user.id": id })
      .sort({ createdAt: -1 })
      .limit(20);

    return res.json({
      success: true,
      data: {
        user,
        activities,
        activityCount: await ActivityLog.countDocuments({ "user.id": id }),
      },
    });
  } catch (error) {
    console.error("Error in getUserDetail:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// exports.toggleUserStatus = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (id === req.user.id) {
//       return res.status(400).json({
//         success: false,
//         message: "Bạn không thể thay đổi trạng thái của chính mình.",
//       });
//     }

//     const user = await User.findById(id);
//     if (!user) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Không tìm thấy user." });
//     }

//     user.isActive = !user.isActive;
//     await user.save();

//     await logActivity(
//       req.user.id,
//       "toggle_user_status",
//       `${user.isActive ? "Activated" : "Deactivated"} user: ${user.name}`,
//       { userId: id, isActive: user.isActive },
//     );

//     return res.json({
//       success: true,
//       message: `Đã ${user.isActive ? "kích hoạt" : "vô hiệu hóa"} user "${user.name}"!`,
//       data: { id: user._id, isActive: user.isActive },
//     });
//   } catch (error) {
//     console.error("Error in toggleUserStatus:", error);
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

// 3. SỬA hàm toggleUserStatus
exports.toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "🚫Bạn không thể thay đổi trạng thái của chính mình!",
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy user.",
      });
    }

    if (isOwner(user.email)) {
      return res.status(403).json({
        success: false,
        message: "Không thể vô hiệu hóa tài khoản Owner!",
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    await logActivity(
      req.user.id,
      "toggle_user_status",
      `${user.isActive ? "Activated" : "Deactivated"} user: ${user.email}`,
      { userId: id, isActive: user.isActive },
    );

    return res.json({
      success: true,
      message: `Đã ${user.isActive ? "kích hoạt" : "vô hiệu hóa"} user!`,
      data: { id: user._id, isActive: user.isActive },
    });
  } catch (error) {
    console.error("Error in toggleUserStatus:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserActivities = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 50, page = 1, action } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = { "user.id": id };
    if (action) filter.action = action;

    const [activities, total] = await Promise.all([
      ActivityLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      ActivityLog.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      data: activities,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error in getUserActivities:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.exportUsers = async (req, res) => {
  try {
    const users = await User.find().select("-twoFactorSecret -oauthId");

    const headers = [
      "ID",
      "Name",
      "Email",
      "Role",
      "2FA",
      "Active",
      "Created At",
    ];
    const rows = users.map((u) => [
      u._id,
      u.name,
      u.email,
      u.role,
      u.twoFactorSecret ? "Yes" : "No",
      u.isActive ? "Yes" : "No",
      new Date(u.createdAt).toISOString(),
    ]);

    let csv = headers.join(",") + "\n";
    rows.forEach((row) => {
      csv += row.join(",") + "\n";
    });

    await logActivity(
      req.user.id,
      "export_users",
      `Exported ${users.length} users`,
      { count: users.length },
    );

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=users_${Date.now()}.csv`,
    );
    res.send(csv);
  } catch (error) {
    console.error("Error in exportUsers:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSystemHealth = async (req, res) => {
  try {
    const mongoose = require("mongoose");
    const os = require("os");

    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status:
            mongoose.connection.readyState === 1 ? "connected" : "disconnected",
          readyState: mongoose.connection.readyState,
        },
        memory: {
          total: (os.totalmem() / 1024 / 1024 / 1024).toFixed(2) + " GB",
          free: (os.freemem() / 1024 / 1024 / 1024).toFixed(2) + " GB",
          usage: ((1 - os.freemem() / os.totalmem()) * 100).toFixed(1) + "%",
        },
        cpu: {
          cores: os.cpus().length,
          load: os.loadavg(),
        },
        uptime: {
          system: formatUptime(os.uptime()),
          process: formatUptime(process.uptime()),
        },
      },
      process: {
        memory: (process.memoryUsage().rss / 1024 / 1024).toFixed(0) + " MB",
        pid: process.pid,
        version: process.version,
      },
    };
    if (mongoose.connection.readyState !== 1) {
      health.status = "degraded";
    }

    res.status(200).json({ success: true, data: health });
  } catch (error) {
    console.error("Error getting system health:", error);
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
