const express = require("express");
const router = express.Router();
const recommendationController = require("../controllers/recommendationController");
const protect = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");

router.use(protect, authorize(["student"]));

router.get("/", recommendationController.listerMesRecommandations);
router.patch("/marquer-lues", recommendationController.marquerToutesLues);

module.exports = router;