// ============================================================
// controllers/courseController.js
// ============================================================

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

const Inscription = require("../models/Inscription");
const QuizAttempt = require("../models/QuizAttempt");
const Quiz = require("../models/Quiz");

// Liste les students inscrits aux cours d un teacher precis, avec leur moyenne
exports.studentsDuTeacher = async (req, res) => {
  try {
    const idDuTeacher = req.params.teacherId;

    // 1. tous les cours de ce teacher
    const cours = await Course.find({ teacher: idDuTeacher });
    const idsDesCours = cours.map(function (c) {
      return c._id;
    });

    // 2. toutes les inscriptions a ces cours, avec les infos du student et du cours
    const inscriptions = await Inscription.find({ course: { $in: idsDesCours } })
      .populate("student")
      .populate("course");

    // 3. tous les quiz de ces cours (pour calculer la moyenne apres)
    const quizzes = await Quiz.find({ course: { $in: idsDesCours } });
    const idsDesQuiz = quizzes.map(function (q) {
      return q._id;
    });

    const resultat = [];

    for (let i = 0; i < inscriptions.length; i++) {
      const inscription = inscriptions[i];

      // compte combien de cours de ce teacher ce student a rejoint
      const inscriptionsDeCeStudent = inscriptions.filter(function (ins) {
        return ins.student._id.toString() === inscription.student._id.toString();
      });

      // recupere les tentatives de quiz de ce student, seulement pour les quiz de ce teacher
      const tentatives = await QuizAttempt.find({
        student: inscription.student._id,
        quiz: { $in: idsDesQuiz },
      });

      let moyenne = 0;
      if (tentatives.length > 0) {
        let somme = 0;
        for (let j = 0; j < tentatives.length; j++) {
          somme = somme + tentatives[j].score;
        }
        moyenne = somme / tentatives.length;
      }

      // evite les doublons si le student est inscrit a plusieurs cours du meme teacher
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