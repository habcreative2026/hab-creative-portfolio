const router = require("express").Router();
const SystemSettings = require("../models/SystemSettings");

router.get("/maintenance", async (req, res) => {
  try {
    const settings = await SystemSettings.findOne();
    if (settings?.maintenanceMode?.enabled) {
      return res.json({
        maintenance: true,
        message: settings.maintenanceMode.message,
      });
    }
    res.json({ maintenance: false });
  } catch (error) {
    console.error("Error checking maintenance:", error);
    res.json({ maintenance: false });
  }
});

module.exports = router;
