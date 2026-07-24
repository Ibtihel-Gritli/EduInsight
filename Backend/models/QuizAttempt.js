const mongoose = require("mongoose");

const quizAttemptSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
    score: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
    startedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date },
    duration: { type: Number }, // en secondes
  },
  { timestamps: true }
);

// + calculateScore(): calcule le score final
quizAttemptSchema.methods.calculateScore = function () {
  return this.score;
};

module.exports = mongoose.model("QuizAttempt", quizAttemptSchema);