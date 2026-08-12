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

// Mettre a jour un student
exports.updateStudent = async (req, res) => {
  try {
    const studentMisAJour = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!studentMisAJour) {
      return res.status(404).json({ message: "Student non trouve" });
    }
    res.json(studentMisAJour);
  } catch (err) {
    res.status(400).json({ message: "Erreur de mise a jour", error: err.message });
  }
};

// Supprimer un student
exports.deleteStudent = async (req, res) => {
  try {
    const studentSupprime = await Student.findByIdAndDelete(req.params.id);
    if (!studentSupprime) {
      return res.status(404).json({ message: "Student non trouve" });
    }
    res.json({ message: "Student supprime" });
  } catch (err) {
    res.status(500).json({ message: "Erreur de suppression", error: err.message });
  }
};

const Inscription = require("../models/Inscription");

// Voir les cours auxquels un student est inscrit
exports.mesCours = async (req, res) => {
  try {
    const inscriptions = await Inscription.find({ student: req.params.id }).populate("course");
    res.json(inscriptions);
  } catch (err) {
    res.status(500).json({ message: "Erreur", error: err.message });
  }
};