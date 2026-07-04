const SystemSettings = require("../models/SystemSettings");

const maintenanceMiddleware = async (req, res, next) => {
  try {
    if (
      req.path.startsWith("/api/admin") ||
      req.path.startsWith("/api/auth") ||
      req.path.startsWith("/api/settings/maintenance")
    ) {
      return next();
    }

    const settings = await SystemSettings.findOne();
    if (settings?.maintenanceMode?.enabled) {
      return res.status(503).json({
        success: false,
        maintenance: true,
        message:
          settings.maintenanceMode.message ||
          "Hệ thống đang được bảo trì. Vui lòng quay lại sau.",
      });
    }
    next();
  } catch (error) {
    console.error("Maintenance middleware error:", error);
    next();
  }
};

module.exports = maintenanceMiddleware;
