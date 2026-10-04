// ============================================================
// models/Recommendation.js
// Une recommandation de cours pour un student, avec statut lu/non-lu
// ============================================================

const mongoose = require("mongoose");

const recommendationSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    message: { type: String, required: true },
    type: { type: String, default: "course" },
    confidenceScore: { type: Number, default: 0 },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// + isRelevant(): verifie si la recommandation est fiable
recommendationSchema.methods.isRelevant = function () {
  return this.confidenceScore >= 50;
};

// Un student ne peut pas avoir 2 fois la meme recommandation pour le meme cours
recommendationSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model("Recommendation", recommendationSchema);