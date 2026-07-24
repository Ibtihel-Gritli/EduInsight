// ============================================================
// controllers/analyticsController.js
// ============================================================

const QuizAttempt = require("../models/QuizAttempt");
const Inscription = require("../models/Inscription");
const PerformanceMetric = require("../models/PerformanceMetric");
const DashboardData = require("../models/DashboardData");

exports.generateForStudent = async (req, res) => {
  try {
    const studentId = req.user.id;
    const attempts = await QuizAttempt.find({ student: studentId });
    const enrollments = await Inscription.find({ student: studentId });

    const totalCourses = enrollments.length;

    let sommeScores = 0;
    for (let i = 0; i < attempts.length; i++) {
      sommeScores = sommeScores + attempts[i].score;
    }
    const nombreTentatives = attempts.length > 0 ? attempts.length : 1;
    const averageScore = sommeScores / nombreTentatives;

    const dashboard = await DashboardData.findOneAndUpdate(
      { user: studentId },
      { user: studentId, totalCourses: totalCourses, averageScore: averageScore },
      { upsert: true, new: true }
    );

    res.json(dashboard);
  } catch (err) {
    res.status(400).json({ message: "Erreur", error: err.message });
  }
};

exports.generateForTeacher = async (req, res) => {
  try {
    const metrics = await PerformanceMetric.find({ course: req.params.courseId });
    res.json(metrics);
  } catch (err) {
    res.status(400).json({ message: "Erreur", error: err.message });
  }
};

exports.generateForAdmin = async (req, res) => {
  try {
    const totalStudents = await Inscription.countDocuments();
    res.json({ totalStudents: totalStudents });
  } catch (err) {
    res.status(400).json({ message: "Erreur", error: err.message });
  }
};