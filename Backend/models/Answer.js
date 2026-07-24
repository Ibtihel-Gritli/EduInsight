const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema({
  attempt: { type: mongoose.Schema.Types.ObjectId, ref: "QuizAttempt", required: true },
  question: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
  selectedChoice: { type: mongoose.Schema.Types.ObjectId, ref: "Choice" },
  textAnswer: { type: String },
  isCorrect: { type: Boolean, default: false },
  pointsEarned: { type: Number, default: 0 },
});

module.exports = mongoose.model("Answer", answerSchema);