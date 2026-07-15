// ============================================================
// controllers/studentController.js
// ============================================================

const { Student } = require("../models/User");

exports.ajouterStudent = async (req, res) => {
  try {
    const nouveauStudent = new Student(req.body);
    await nouveauStudent.save();
    res.status(201).json(nouveauStudent);
  } catch (err) {
    res.status(400).json({ message: "Erreur d ajout student", error: err.message });
  }
};

exports.listerStudents = async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.inscrireStudentACours = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student non trouve" });
    }

    const courseId = req.body.courseId;
    const inscription = await student.enrollCourse(courseId);
    res.status(201).json(inscription);
  } catch (err) {
    res.status(400).json({ message: "Erreur", error: err.message });
  }
};