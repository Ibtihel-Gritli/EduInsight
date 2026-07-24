//(Quiz + Question + Choice)

const Quiz = require("../models/Quiz");
const Question = require("../models/Question");
const Choice = require("../models/Choice");

exports.createQuiz = async (req, res) => {
  try {
    const data = req.body;
    data.course = req.params.courseId;
    data.createdBy = req.user.id;
    const nouveauQuiz = await Quiz.create(data);
    res.status(201).json(nouveauQuiz);
  } catch (err) {
    res.status(400).json({ message: "Erreur d ajout", error: err.message });
  }
};

exports.publishQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      { isPublished: true },
      { new: true }
    );
    if (!quiz) {
      return res.status(404).json({ message: "Quiz non trouve" });
    }
    res.json(quiz);
  } catch (err) {
    res.status(400).json({ message: "Erreur", error: err.message });
  }
};

exports.addQuestion = async (req, res) => {
  try {
    const choices = req.body.choices;
    const questionData = {
      quiz: req.params.quizId,
      statement: req.body.statement,
      type: req.body.type,
      points: req.body.points,
      order: req.body.order,
    };

    const question = await Question.create(questionData);

    if (choices && choices.length > 0) {
      const choiceDocs = [];
      for (let i = 0; i < choices.length; i++) {
        const choix = choices[i];
        choix.question = question._id;
        choiceDocs.push(choix);
      }
      await Choice.insertMany(choiceDocs);
    }

    res.status(201).json(question);
  } catch (err) {
    res.status(400).json({ message: "Erreur d ajout", error: err.message });
  }
};

exports.deleteQuiz = async (req, res) => {
  try {
    const quizSupprime = await Quiz.findByIdAndDelete(req.params.id);
    if (!quizSupprime) {
      return res.status(404).json({ message: "Quiz non trouve" });
    }
    res.json({ message: "Quiz supprime" });
  } catch (err) {
    res.status(500).json({ message: "Erreur de suppression", error: err.message });
  }
};