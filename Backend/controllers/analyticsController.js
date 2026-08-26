// ============================================================
// controllers/analyticsController.js
// ============================================================

const { Student, User } = require("../models/User");
const Inscription = require("../models/Inscription");
const PerformanceMetric = require("../models/PerformanceMetric");
const DashboardData = require("../models/DashboardData");
const QuizAttempt = require("../models/QuizAttempt");
const Course = require("../models/Course");

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

// Statistiques des students, avec filtres level et status
exports.studentsStats = async (req, res) => {
  try {
    const level = req.query.level;
    const status = req.query.status;

    const filtre = {};
    if (level && level !== "all") {
      filtre.level = level;
    }
    if (status === "active") {
      filtre.isActive = true;
    }
    if (status === "inactive") {
      filtre.isActive = false;
    }

    const students = await Student.find(filtre);
    const total = students.length;

    let actifs = 0;
    let inactifs = 0;
    let garcons = 0;
    let filles = 0;

    for (let i = 0; i < students.length; i++) {
      const etudiant = students[i];

      if (etudiant.isActive === true) {
        actifs = actifs + 1;
      } else {
        inactifs = inactifs + 1;
      }

      if (etudiant.gender === "M") {
        garcons = garcons + 1;
      }
      if (etudiant.gender === "F") {
        filles = filles + 1;
      }
    }

    const niveaux = {};
    for (let i = 0; i < students.length; i++) {
      const niveauActuel = students[i].level || "Non defini";
      if (niveaux[niveauActuel]) {
        niveaux[niveauActuel] = niveaux[niveauActuel] + 1;
      } else {
        niveaux[niveauActuel] = 1;
      }
    }

    const byLevel = [];
    for (const nom in niveaux) {
      byLevel.push({ level: nom, count: niveaux[nom] });
    }

    const byGender = [
      { gender: "Garcons", count: garcons },
      { gender: "Filles", count: filles },
    ];

    const idsEtudiants = students.map(function (s) {
      return s._id;
    });
    const tentatives = await QuizAttempt.find({ student: { $in: idsEtudiants } });

    let moyenneGenerale = 0;
    if (tentatives.length > 0) {
      let sommeScores = 0;
      for (let i = 0; i < tentatives.length; i++) {
        sommeScores = sommeScores + tentatives[i].score;
      }
      moyenneGenerale = sommeScores / tentatives.length;
    }

    res.json({
      total: total,
      actifs: actifs,
      inactifs: inactifs,
      garcons: garcons,
      filles: filles,
      moyenneGenerale: moyenneGenerale,
      byLevel: byLevel,
      byGender: byGender,
    });
  } catch (err) {
    res.status(500).json({ message: "Erreur", error: err.message });
  }
};

// Statistiques generales pour le Dashboard Admin
exports.adminDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeCourses = await Course.countDocuments();

    const totalAttempts = await QuizAttempt.countDocuments();
    const attemptsSoumises = await QuizAttempt.countDocuments({ submittedAt: { $ne: null } });
    let quizCompletion = 0;
    if (totalAttempts > 0) {
      quizCompletion = Math.round((attemptsSoumises / totalAttempts) * 100);
    }

    const toutesLesTentatives = await QuizAttempt.find();
    let avgGrade = 0;
    if (toutesLesTentatives.length > 0) {
      let somme = 0;
      for (let i = 0; i < toutesLesTentatives.length; i++) {
        somme = somme + toutesLesTentatives[i].score;
      }
      avgGrade = Math.round(somme / toutesLesTentatives.length);
    }

    const tousLesUsers = await User.find().select("createdAt");
    const parMois = {};
    for (let i = 0; i < tousLesUsers.length; i++) {
      const date = new Date(tousLesUsers[i].createdAt);
      const cle = date.getFullYear() + "-" + (date.getMonth() + 1);
      if (parMois[cle]) {
        parMois[cle] = parMois[cle] + 1;
      } else {
        parMois[cle] = 1;
      }
    }
    const growth = [];
    for (const mois in parMois) {
      growth.push({ mois: mois, users: parMois[mois] });
    }

    const totalAdmins = await User.countDocuments({ role: "admin" });
    const totalTeachers = await User.countDocuments({ role: "teacher" });
    const totalStudents = await User.countDocuments({ role: "student" });

    const distribution = [
      { role: "Students", count: totalStudents },
      { role: "Teachers", count: totalTeachers },
      { role: "Admins", count: totalAdmins },
    ];

    res.json({
      totalUsers: totalUsers,
      activeCourses: activeCourses,
      quizCompletion: quizCompletion,
      avgGrade: avgGrade,
      growth: growth,
      distribution: distribution,
    });
  } catch (err) {
    res.status(500).json({ message: "Erreur", error: err.message });
  }
};

// Calcule la progression d un student : cours completes, moyenne generale,
// historique des scores de quiz, et le detail par cours
exports.studentProgress = async (req, res) => {
  try {
    const studentId = req.user.id;

    // Toutes les inscriptions du student, avec les infos du cours
    const inscriptions = await Inscription.find({ student: studentId }).populate("course");

    // Toutes les tentatives de quiz du student, avec le quiz ET le cours du quiz
    const tentatives = await QuizAttempt.find({ student: studentId })
      .populate({ path: "quiz", populate: { path: "course" } })
      .sort({ startedAt: 1 }); // du plus ancien au plus recent, pour l historique

    // --- Carte "Courses Completed" ---
    let coursesCompleted = 0;
    for (let i = 0; i < inscriptions.length; i++) {
      if (inscriptions[i].status === "completed") {
        coursesCompleted = coursesCompleted + 1;
      }
    }

    // --- Carte "Average Grade" ---
    let avgGrade = 0;
    if (tentatives.length > 0) {
      let somme = 0;
      for (let i = 0; i < tentatives.length; i++) {
        somme = somme + tentatives[i].score;
      }
      avgGrade = Math.round(somme / tentatives.length);
    }

    // --- Graphique "Grade History" : un point par tentative de quiz ---
    const gradeHistory = [];
    for (let i = 0; i < tentatives.length; i++) {
      gradeHistory.push({
        label: "Quiz " + (i + 1),
        score: tentatives[i].score,
      });
    }

    // --- Tableau du bas : moyenne et statut pour chaque cours inscrit ---
    const courses = [];

    for (let i = 0; i < inscriptions.length; i++) {
      const inscriptionActuelle = inscriptions[i];

      // on ne garde que les tentatives dont le quiz appartient a CE cours
      const tentativesDeCeCours = [];
      for (let j = 0; j < tentatives.length; j++) {
        const quizActuel = tentatives[j].quiz;
        if (quizActuel && quizActuel.course && inscriptionActuelle.course) {
          if (quizActuel.course._id.toString() === inscriptionActuelle.course._id.toString()) {
            tentativesDeCeCours.push(tentatives[j]);
          }
        }
      }

      let moyenneDuCours = 0;
      if (tentativesDeCeCours.length > 0) {
        let somme = 0;
        for (let j = 0; j < tentativesDeCeCours.length; j++) {
          somme = somme + tentativesDeCeCours[j].score;
        }
        moyenneDuCours = Math.round(somme / tentativesDeCeCours.length);
      }

      const statut = inscriptionActuelle.status === "completed" ? "Completed" : "In Progress";

      courses.push({
        title: inscriptionActuelle.course ? inscriptionActuelle.course.title : "Cours supprime",
        grade: moyenneDuCours,
        status: statut,
      });
    }

    res.json({
      coursesCompleted: coursesCompleted,
      avgGrade: avgGrade,
      gradeHistory: gradeHistory,
      courses: courses,
    });
  } catch (err) {
    res.status(500).json({ message: "Erreur", error: err.message });
  }
};