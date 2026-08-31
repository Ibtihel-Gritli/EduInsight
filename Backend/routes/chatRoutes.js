const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const protect = require("../middlewares/authMiddleware");

// accessible a tout utilisateur connecte, peu importe son role
router.post("/", protect, chatController.envoyerMessage);

module.exports = router;