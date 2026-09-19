const express = require("express");
const router = express.Router();
const subscriberController = require("../controllers/subscriber.controller");
const { uploadImage } = require("../config/cloudinary");

// ==================== BROADCAST ROUTES (đặt trước /:id) ====================
router.post(
  "/broadcast/upload-image",
  uploadImage.single("image"),
  (req, res) => {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Không có file!" });
    }
    res.status(200).json({
      success: true,
      data: { imageUrl: req.file.path },
    });
  },
);
router.post("/broadcast/send", subscriberController.sendBroadcast);
router.get("/broadcast", subscriberController.getAllBroadcasts);
router.delete("/broadcast/:id", subscriberController.deleteBroadcast);

// ==================== SUBSCRIBER ROUTES ====================
router.post("/subscribe", subscriberController.subscribe);
router.get("/", subscriberController.getAllSubscribers);
router.delete("/:id", subscriberController.deleteSubscriber);
router.patch("/:id/toggle", subscriberController.toggleSubscriber);

module.exports = router;
