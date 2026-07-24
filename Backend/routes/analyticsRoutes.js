// ============================================================
// routes/analyticsRoutes.js
// ============================================================

const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");
const protect = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");

router.get("/student", protect, authorize(["student"]), analyticsController.generateForStudent);
router.get(
  "/teacher/course/:courseId",
  protect,
  authorize(["teacher"]),
  analyticsController.generateForTeacher
);
router.get("/admin", protect, authorize(["admin"]), analyticsController.generateForAdmin);

module.exports = router;