// ============================================================
// controllers/studentController.js
// ============================================================

const { Student } = require("../models/User");
const Inscription = require("../models/Inscription");
const Course = require("../models/Course");

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

exports.mesCours = async (req, res) => {
  try {
    const inscriptions = await Inscription.find({ student: req.params.id })
      .populate({
        path: "course",
        populate: { path: "teacher" },
      });

    // on retire les inscriptions dont le cours a ete supprime entre temps
    const inscriptionsValides = inscriptions.filter(function (i) {
      return i.course !== null;
    });

    res.json(inscriptionsValides);
  } catch (err) {
    res.status(500).json({ message: "Erreur", error: err.message });
  }
};

// ------------------------------------------------------------
// Liste les students inscrits aux cours du teacher connecte
// Avg Grade = taux d avancement : cours completes / cours inscrits
// (meme formule que StudentCourses et StudentProgress)
// ------------------------------------------------------------
const gradeService = require("../services/gradeService"); // ajoute cet import en haut du fichier, avec les autres

// ------------------------------------------------------------
// Liste les students inscrits aux cours du teacher connecte
// Avg Grade = meme formule centralisee que StudentCourses / StudentProgress / Admin
// ------------------------------------------------------------
exports.listStudentsByTeacher = async (req, res) => {
  try {
    const teacherId = req.user.id;

    const mesCoursDeProf = await Course.find({ teacher: teacherId });
    const idsDeMesCours = mesCoursDeProf.map(function (c) {
      return c._id;
    });

    const inscriptions = await Inscription.find({ course: { $in: idsDeMesCours } })
      .populate("student")
      .populate("course");

    const parStudent = {};

    for (let i = 0; i < inscriptions.length; i++) {
      const inscriptionActuelle = inscriptions[i];
      if (!inscriptionActuelle.student) {
        continue;
      }

      const idDuStudent = inscriptionActuelle.student._id.toString();

      if (!parStudent[idDuStudent]) {
        parStudent[idDuStudent] = {
          student: inscriptionActuelle.student,
          nombreCoursChezMoi: 0,
        };
      }

      parStudent[idDuStudent].nombreCoursChezMoi = parStudent[idDuStudent].nombreCoursChezMoi + 1;
    }

    const resultat = [];

    for (const idDuStudent in parStudent) {
      const infosStudent = parStudent[idDuStudent];

      // Meme formule centralisee que partout ailleurs, scopee sur les cours de ce teacher
      const avgGrade = await gradeService.calculerAvgGrade(idDuStudent, idsDeMesCours);

      resultat.push({
        lastName: infosStudent.student.lastName,
        email: infosStudent.student.email,
        enrolled: infosStudent.nombreCoursChezMoi,
        avgGrade: avgGrade,
      });
    }

    res.json(resultat);
  } catch (err) {
    res.status(500).json({ message: "Erreur", error: err.message });
  }
};