const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    title: { type: String, required: true },
    description: { type: String },
    duration: { type: Number }, // en minutes
    passingScore: { type: Number, default: 50 },
    isPublished: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// + publish(): publie le quiz
quizSchema.methods.publish = async function () {
  this.isPublished = true;
  await this.save();
  return this;
};

// + addQuestion(data): ajoute une question a ce quiz
quizSchema.methods.addQuestion = async function (data) {
  const Question = mongoose.model("Question");
  data.quiz = this._id;
  const nouvelleQuestion = new Question(data);
  await nouvelleQuestion.save();
  return nouvelleQuestion;
};

module.exports = mongoose.model("Quiz", quizSchema);