// ============================================================
// routes/authRoutes.js
// ============================================================

const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const protect = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");

router.post("/register", authController.register);
router.post("/login", authController.login);

router.get("/profil", protect, authorize(["admin", "teacher", "student"]), (req, res) => {
  res.json({ message: "Profil utilisateur", user: req.user });
});

module.exports = router;