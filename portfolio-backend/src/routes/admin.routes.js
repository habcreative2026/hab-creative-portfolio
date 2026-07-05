// backend/routes/admin.routes.js

const router = require("express").Router();
const authMiddleware = require("../middlewares/auth.middleware");
const adminController = require("../controllers/admin.controller");
const activityController = require("../controllers/activity.controller");
const systemController = require("../controllers/system.controller");
const dashboardController = require("../controllers/dashboard.controller");

// ✅ Ai cũng xem được profile của mình
router.get("/me", authMiddleware, adminController.profile);

// ═══════════════════════════════════════════
// 🔴 SUPER ADMIN + OWNER (Quản lý user)
// ═══════════════════════════════════════════
router.delete(
  "/users/:id",
  authMiddleware,
  authMiddleware.isSuperAdmin,
  authMiddleware.isOwner,
  adminController.deleteUser,
);

router.put(
  "/users/:id/role",
  authMiddleware,
  authMiddleware.isSuperAdmin,
  authMiddleware.isOwner,
  adminController.updateUserRole,
);

router.put(
  "/users/:id/toggle",
  authMiddleware,
  authMiddleware.isSuperAdmin,
  authMiddleware.isOwner,
  adminController.toggleUserStatus,
);

// ═══════════════════════════════════════════
// 🟡 SUPER ADMIN (Xem danh sách user)
// ═══════════════════════════════════════════
router.get(
  "/users",
  authMiddleware,
  authMiddleware.isSuperAdmin,
  adminController.getAllUsers,
);

router.get(
  "/users/:id",
  authMiddleware,
  authMiddleware.isSuperAdmin,
  adminController.getUserDetail,
);

// ═══════════════════════════════════════════
// 🟡 SUPER ADMIN (Xem activity)
// ═══════════════════════════════════════════
router.get(
  "/activities",
  authMiddleware,
  authMiddleware.isSuperAdmin,
  activityController.getActivityLogs,
);

router.get(
  "/activities/stats",
  authMiddleware,
  authMiddleware.isSuperAdmin,
  activityController.getActivityStats,
);

router.post(
  "/activities/log",
  authMiddleware,
  authMiddleware.isSuperAdmin,
  activityController.logActivityHandler,
);

// ═══════════════════════════════════════════
// 🟡 SUPER ADMIN (Settings)
// ═══════════════════════════════════════════
router.get(
  "/settings",
  authMiddleware,
  authMiddleware.isSuperAdmin,
  systemController.getSettings,
);

router.put(
  "/settings",
  authMiddleware,
  authMiddleware.isSuperAdmin,
  systemController.updateSettings,
);

// ═══════════════════════════════════════════
// 🔴 OWNER ONLY (Backup, Restore, System)
// ═══════════════════════════════════════════
router.get(
  "/backup",
  authMiddleware,
  authMiddleware.isOwner,
  systemController.backupDatabase,
);

router.post(
  "/restore",
  authMiddleware,
  authMiddleware.isOwner,
  systemController.restoreDatabase,
);

router.get(
  "/system-info",
  authMiddleware,
  authMiddleware.isOwner,
  systemController.getSystemInfo,
);

// ═══════════════════════════════════════════
// 🟡 SUPER ADMIN (Dashboard stats)
// ═══════════════════════════════════════════
router.get(
  "/dashboard/stats",
  authMiddleware,
  authMiddleware.isSuperAdmin,
  dashboardController.getDashboardStats,
);

module.exports = router;
