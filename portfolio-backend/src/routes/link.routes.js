const express = require("express");
const router = express.Router();
const linkController = require("../controllers/link.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/public", linkController.getPublicLinks);

router.get("/admin-list", authMiddleware, linkController.getAdminLinks);

router.put("/bulk-update", authMiddleware, linkController.bulkUpdateLinks);

module.exports = router;
