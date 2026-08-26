// ============================================================
// routes/quizRoutes.js
// ============================================================

const express = require("express");
const router = express.Router();
const quizController = require("../controllers/quizController");
const protect = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");

// routes libres (lecture seule)
router.get("/", quizController.listAllQuizzes);
router.get("/:id/questions", protect, quizController.getQuizWithQuestions);

// routes protegees : reservees a teacher et admin
router.use(protect, authorize(["teacher", "admin"]));

router.post("/course/:courseId", quizController.createQuiz);
router.put("/:id", quizController.updateQuiz);
router.put("/:id/questions", quizController.replaceQuestions);
router.patch("/:id/publish", quizController.publishQuiz);
router.post("/:quizId/questions", quizController.addQuestion);
router.delete("/:id", quizController.deleteQuiz);

module.exports = router;