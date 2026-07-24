const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
    statement: { type: String, required: true },
    type: { type: String, enum: ["MCQ", "TrueFalse", "ShortAnswer"], required: true },
    points: { type: Number, default: 1 },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", questionSchema);