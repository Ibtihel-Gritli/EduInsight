// ============================================================
// controllers/courseController.js
// ============================================================
const Inscription = require("../models/Inscription");

const Course = require("../models/Course");
const courseService = require("../services/courseService");


exports.ajouterCours = async (req, res) => {
  try {
    // le prof du cours = la personne actuellement connectee (admin ou teacher)
    req.body.teacher = req.user.id;

    const nouveauCours = await courseService.creerCours(req.body);
    res.status(201).json(nouveauCours);
  } catch (err) {
    res.status(400).json({ message: "Erreur d ajout", error: err.message });
  }
};

// Ajouter un cours AVEC pdf
exports.ajouterCoursAvecImage = async (req, res) => {
  try {
    const nouveauCours = new Course({
      title: req.body.title,
      description: req.body.description,
      level: req.body.level,
      duration: req.body.duration,
      pdfUrl: req.file ? req.file.filename : null,
      teacher: req.user.id, // meme logique ici
    });

    await nouveauCours.save();
    res.status(201).json(nouveauCours);
  } catch (err) {
    res.status(400).json({ message: "Erreur d ajout", error: err.message });
  }
};


exports.listerCours = async (req, res) => {
  try {
    // on lit les parametres dans l URL, avec des valeurs par defaut
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const resultat = await courseService.listerCoursPagines(page, limit);
    res.json(resultat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCoursById = async (req, res) => {
  try {
    const cours = await courseService.getCoursParId(req.params.id);
    if (!cours) {
      return res.status(404).json({ message: "Cours non trouve" });
    }
    res.json(cours);
  } catch (err) {
    res.status(500).json({ message: "Erreur", error: err.message });
  }
};

exports.updateCours = async (req, res) => {
  try {
    const coursMisAJour = await courseService.updateCours(req.params.id, req.body);
    if (!coursMisAJour) {
      return res.status(404).json({ message: "Cours non trouve" });
    }
    res.json(coursMisAJour);
  } catch (err) {
    res.status(400).json({ message: "Erreur de mise a jour", error: err.message });
  }
};


exports.deleteCours = async (req, res) => {
  try {
    // on supprime d abord toutes les inscriptions liees a ce cours,
    // pour eviter des inscriptions "orphelines" qui pointent vers rien
    await Inscription.deleteMany({ course: req.params.id });

    const coursSupprime = await courseService.deleteCours(req.params.id);
    if (!coursSupprime) {
      return res.status(404).json({ message: "Cours non trouve" });
    }
    res.json({ message: "Cours supprime avec succes" });
  } catch (err) {
    res.status(500).json({ message: "Erreur de suppression", error: err.message });
  }
};

exports.ajouterModule = async (req, res) => {
  try {
    const nouveauModule = await courseService.ajouterModule(req.params.id, req.body);
    res.status(201).json(nouveauModule);
  } catch (err) {
    res.status(400).json({ message: "Erreur", error: err.message });
  }
};

const QuizAttempt = require("../models/QuizAttempt");
const Quiz = require("../models/Quiz");

// Liste les students inscrits aux cours d un teacher precis, avec leur moyenne
const gradeService = require("../services/gradeService"); // ajoute cet import en haut du fichier

// Liste les students inscrits aux cours d un teacher precis, avec leur moyenne
exports.studentsDuTeacher = async (req, res) => {
  try {
    const idDuTeacher = req.params.teacherId;

    const cours = await Course.find({ teacher: idDuTeacher });
    const idsDesCours = cours.map(function (c) {
      return c._id;
    });

    const inscriptions = await Inscription.find({ course: { $in: idsDesCours } })
      .populate("student")
      .populate("course");

    const resultat = [];

    for (let i = 0; i < inscriptions.length; i++) {
      const inscription = inscriptions[i];

      const inscriptionsDeCeStudent = inscriptions.filter(function (ins) {
        return ins.student._id.toString() === inscription.student._id.toString();
      });

      // Meme formule centralisee, mais scopee UNIQUEMENT sur les cours de ce teacher
      const moyenne = await gradeService.calculerAvgGrade(inscription.student._id, idsDesCours);

      const dejaAjoute = resultat.find(function (r) {
        return r.studentId === inscription.student._id.toString();
      });

      if (!dejaAjoute) {
        resultat.push({
          studentId: inscription.student._id.toString(),
          lastName: inscription.student.lastName,
          email: inscription.student.email,
          enrolled: inscriptionsDeCeStudent.length,
          avgGrade: moyenne,
        });
      }
    }

    res.json(resultat);
  } catch (err) {
    res.status(500).json({ message: "Erreur", error: err.message });
  }
};

exports.retirerStudent = async (req, res) => {
  try {
    const idDuTeacher = req.params.teacherId;
    const idDuStudent = req.params.studentId;

    const cours = await Course.find({ teacher: idDuTeacher });
    const idsDesCours = cours.map(function (c) {
      return c._id;
    });

    await Inscription.deleteMany({ student: idDuStudent, course: { $in: idsDesCours } });

    res.json({ message: "Student retire" });
  } catch (err) {
    res.status(500).json({ message: "Erreur", error: err.message });
  }
};