const mongoose = require("mongoose");

const recommendationSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    type: { type: String },
    confidenceScore: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// + isRelevant(): verifie si la recommandation est fiable
recommendationSchema.methods.isRelevant = function () {
  return this.confidenceScore >= 50;
};

module.exports = mongoose.model("Recommendation", recommendationSchema);