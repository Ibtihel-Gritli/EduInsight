// ============================================================
// routes/quizAttemptRoutes.js
// ============================================================

const express = require("express");
const router = express.Router();
const quizAttemptController = require("../controllers/quizAttemptController");
const protect = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");

router.use(protect);

// Renvoie toutes les tentatives d un student (utilise pour Best Score)
router.get("/mes-tentatives/:userId", quizAttemptController.mesTentatives);

// Demarrer une tentative et soumettre les reponses : reserve au student
router.post("/start/:quizId", authorize(["student"]), quizAttemptController.takeQuiz);
router.post("/:attemptId/submit", authorize(["student"]), quizAttemptController.submitAnswers);

module.exports = router;