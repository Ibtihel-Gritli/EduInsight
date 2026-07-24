const express = require("express");
const router = express.Router();
const quizController = require("../controllers/quizController");
const protect = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");

router.use(protect, authorize(["teacher", "admin"]));

router.post("/course/:courseId", quizController.createQuiz);
router.patch("/:id/publish", quizController.publishQuiz);
router.post("/:quizId/questions", quizController.addQuestion);
router.delete("/:id", quizController.deleteQuiz);

module.exports = router;