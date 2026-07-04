const express = require("express");
const router = express.Router();
const marqueeController = require("../controllers/marquee.controller");

const { uploadImage } = require("../config/cloudinary");

router.get("/", marqueeController.getMarqueeLogos);
router.post(
  "/add",
  uploadImage.single("image"),
  marqueeController.addMarqueeLogo,
);
router.delete("/remove/:resourceId", marqueeController.removeMarqueeLogo);
router.put("/reorder", marqueeController.reorderMarqueeLogos);

module.exports = router;
