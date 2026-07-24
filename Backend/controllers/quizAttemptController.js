const QuizAttempt = require("../models/QuizAttempt");
const Answer = require("../models/Answer");
const Question = require("../models/Question");
const Choice = require("../models/Choice");

exports.takeQuiz = async (req, res) => {
  try {
    const tentative = await QuizAttempt.create({
      student: req.user.id,
      quiz: req.params.quizId,
    });
    res.status(201).json(tentative);
  } catch (err) {
    res.status(400).json({ message: "Erreur", error: err.message });
  }
};

exports.submitAnswers = async (req, res) => {
  try {
    const attemptId = req.params.attemptId;
    const answers = req.body.answers; // liste de { questionId, selectedChoiceId, textAnswer }

    const attempt = await QuizAttempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({ message: "Tentative non trouvee" });
    }

    let totalScore = 0;

    for (let i = 0; i < answers.length; i++) {
      const item = answers[i];
      const question = await Question.findById(item.questionId);

      let isCorrect = false;
      let pointsEarned = 0;

      if (question.type === "MCQ" || question.type === "TrueFalse") {
        const bonneReponse = await Choice.findOne({ question: question._id, isCorrect: true });
        if (bonneReponse && bonneReponse._id.toString() === item.selectedChoiceId) {
          isCorrect = true;
          pointsEarned = question.points;
        }
      }

      totalScore = totalScore + pointsEarned;

      await Answer.create({
        attempt: attempt._id,
        question: question._id,
        selectedChoice: item.selectedChoiceId,
        textAnswer: item.textAnswer,
        isCorrect: isCorrect,
        pointsEarned: pointsEarned,
      });
    }

    attempt.score = totalScore;
    attempt.submittedAt = new Date();
    attempt.duration = Math.floor((attempt.submittedAt - attempt.startedAt) / 1000);
    await attempt.save();

    res.json({ score: attempt.score });
  } catch (err) {
    res.status(400).json({ message: "Erreur", error: err.message });
  }
};