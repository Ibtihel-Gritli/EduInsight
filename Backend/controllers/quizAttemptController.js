const QuizAttempt = require("../models/QuizAttempt");
const Answer = require("../models/Answer");
const Question = require("../models/Question");
const Choice = require("../models/Choice");
const Quiz = require("../models/Quiz");
const Inscription = require("../models/Inscription");

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
    const answers = req.body.answers;

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

    // ------------------------------------------------------------
    // Verifie si le student a maintenant passe TOUS les quiz du cours.
    // Si oui, on marque son inscription a ce cours comme "completed".
    // ------------------------------------------------------------
    const quizActuel = await Quiz.findById(attempt.quiz);

    if (quizActuel) {
      const idDuCours = quizActuel.course;

      const tousLesQuizDuCours = await Quiz.find({ course: idDuCours });
      const idsDeTousLesQuiz = tousLesQuizDuCours.map(function (q) {
        return q._id.toString();
      });

      const tentativesSoumises = await QuizAttempt.find({
        student: attempt.student,
        quiz: { $in: idsDeTousLesQuiz },
        submittedAt: { $ne: null },
      });

      const idsQuizSoumisParLeStudent = [];
      for (let i = 0; i < tentativesSoumises.length; i++) {
        const idQuiz = tentativesSoumises[i].quiz.toString();
        if (idsQuizSoumisParLeStudent.indexOf(idQuiz) === -1) {
          idsQuizSoumisParLeStudent.push(idQuiz);
        }
      }

      if (idsDeTousLesQuiz.length > 0 && idsQuizSoumisParLeStudent.length >= idsDeTousLesQuiz.length) {
        await Inscription.findOneAndUpdate(
          { student: attempt.student, course: idDuCours },
          { status: "completed" }
        );
      }
    }

    res.json({ score: attempt.score });
  } catch (err) {
    res.status(400).json({ message: "Erreur", error: err.message });
  }
};

// ------------------------------------------------------------
// Renvoie toutes les tentatives d un student, avec le quiz rempli
// Utilise pour calculer le "Best Score" dans My Quizzes
// ------------------------------------------------------------
exports.mesTentatives = async (req, res) => {
  try {
    const tentatives = await QuizAttempt.find({ student: req.params.userId }).populate("quiz");
    res.json(tentatives);
  } catch (err) {
    res.status(500).json({ message: "Erreur", error: err.message });
  }
};