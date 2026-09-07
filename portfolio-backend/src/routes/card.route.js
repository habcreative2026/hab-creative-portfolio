const express = require("express");
const router = express.Router();
const cardController = require("../controllers/card.controller");
const { uploadCardProject } = require("../config/cloudinary");

const cardUploadFields = uploadCardProject.fields([
  { name: "homeImage", maxCount: 1 },
  { name: "projectsPageImage", maxCount: 1 },
]);

router.get("/", cardController.getAllCards);

router.post("/", cardUploadFields, cardController.createCard);

router.put("/reorder", cardController.reorderCard);

router.put("/:id", cardUploadFields, cardController.updateCard);

router.delete("/:id", cardController.deleteCard);

module.exports = router;
