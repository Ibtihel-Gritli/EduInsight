// ============================================================
// controllers/studentController.js
// ============================================================

const { Student } = require("../models/User");
const Inscription = require("../models/Inscription");
const Course = require("../models/Course");
const Quiz = require("../models/Quiz");
const QuizAttempt = require("../models/QuizAttempt");

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

// Voir les cours auxquels un student est inscrit
exports.mesCours = async (req, res) => {
  try {
    const inscriptions = await Inscription.find({ student: req.params.id })
      .populate({
        path: "course",
        populate: { path: "teacher" },
      });

    res.json(inscriptions);
  } catch (err) {
    res.status(500).json({ message: "Erreur", error: err.message });
  }
};

// ------------------------------------------------------------
// Liste les students inscrits aux cours du teacher connecte,
// avec le nombre de cours ou ils sont inscrits (chez ce prof)
// et leur moyenne sur les quiz de ces cours
// ------------------------------------------------------------
exports.listStudentsByTeacher = async (req, res) => {
  try {
    const teacherId = req.user.id;

    // 1. tous les cours de ce prof
    const mesCoursDeProf = await Course.find({ teacher: teacherId });
    const idsDeMesCours = mesCoursDeProf.map(function (c) {
      return c._id;
    });

    // 2. tous les quiz de ces cours (pour calculer les moyennes plus tard)
    const quizDeMesCours = await Quiz.find({ course: { $in: idsDeMesCours } });
    const idsDeMesQuiz = quizDeMesCours.map(function (q) {
      return q._id;
    });

    // 3. toutes les inscriptions a ces cours, avec le student rempli
    const inscriptions = await Inscription.find({ course: { $in: idsDeMesCours } })
      .populate("student")
      .populate("course");

    // 4. on regroupe par student
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

    // 5. pour chaque student, calcule sa moyenne sur les quiz de MES cours seulement
    const resultat = [];

    for (const idDuStudent in parStudent) {
      const infosStudent = parStudent[idDuStudent];

      const tentativesDeCeStudent = await QuizAttempt.find({
        student: idDuStudent,
        quiz: { $in: idsDeMesQuiz },
      });

      let avgGrade = 0;
      if (tentativesDeCeStudent.length > 0) {
        let somme = 0;
        for (let i = 0; i < tentativesDeCeStudent.length; i++) {
          somme = somme + tentativesDeCeStudent[i].score;
        }
        avgGrade = Math.round(somme / tentativesDeCeStudent.length);
      }

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