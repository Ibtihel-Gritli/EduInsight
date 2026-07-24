const mongoose = require("mongoose");

const performanceMetricSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    weekName: { type: String },
    quizScoreAverage: { type: Number, default: 0 },
    attendanceRate: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PerformanceMetric", performanceMetricSchema);