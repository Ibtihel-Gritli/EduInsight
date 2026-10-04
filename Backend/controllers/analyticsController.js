// ============================================================
// controllers/analyticsController.js
// ============================================================

const { Student, User } = require("../models/User");
const Inscription = require("../models/Inscription");
const PerformanceMetric = require("../models/PerformanceMetric");
const DashboardData = require("../models/DashboardData");
const QuizAttempt = require("../models/QuizAttempt");
const Course = require("../models/Course");
const Question = require("../models/Question");
const gradeService = require("../services/gradeService");

// Calcule le pourcentage reel d une tentative : score obtenu / score total possible du quiz
// (utilise seulement pour Grade History et le tableau par cours, PAS pour Avg Grade)
async function calculerPourcentage(scoreObtenu, idDuQuiz) {
  const questions = await Question.find({ quiz: idDuQuiz });

  let totalPossible = 0;
  for (let i = 0; i < questions.length; i++) {
    totalPossible = totalPossible + questions[i].points;
  }

  if (totalPossible === 0) {
    return 0;
  }

  return Math.round((scoreObtenu / totalPossible) * 100);
}

// Utilise par la page StudentCourses (carte "Avg Grade")
exports.generateForStudent = async (req, res) => {
  try {
    const studentId = req.user.id;

    const enrollments = await Inscription.find({ student: studentId });
    const totalCourses = enrollments.length;

    // Meme formule que My Progress, via le service centralise
    const averageScore = await gradeService.calculerAvgGrade(studentId);

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

    // Moyenne generale de tous ces students, avec la meme formule centralisee
    let sommeAvgGrades = 0;
    for (let i = 0; i < students.length; i++) {
      const g = await gradeService.calculerAvgGrade(students[i]._id);
      sommeAvgGrades = sommeAvgGrades + g;
    }
    let moyenneGenerale = 0;
    if (students.length > 0) {
      moyenneGenerale = Math.round(sommeAvgGrades / students.length);
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

    // Avg Grade = moyenne du Avg Grade (meme formule) de CHAQUE student de la plateforme
    const tousLesStudents = await Student.find();
    let sommeAvgGrades = 0;
    for (let i = 0; i < tousLesStudents.length; i++) {
      const g = await gradeService.calculerAvgGrade(tousLesStudents[i]._id);
      sommeAvgGrades = sommeAvgGrades + g;
    }
    let avgGrade = 0;
    if (tousLesStudents.length > 0) {
      avgGrade = Math.round(sommeAvgGrades / tousLesStudents.length);
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

// Calcule la progression d un student : cours completes, avancement moyen,
// historique des scores de quiz, et le detail par cours
exports.studentProgress = async (req, res) => {
  try {
    const studentId = req.user.id;

    const inscriptions = await Inscription.find({ student: studentId }).populate("course");

    const tentatives = await QuizAttempt.find({
      student: studentId,
      submittedAt: { $ne: null },
    })
      .populate({ path: "quiz", populate: { path: "course" } })
      .sort({ startedAt: 1 });

    const tentativesAvecPourcentage = [];
    for (let i = 0; i < tentatives.length; i++) {
      if (!tentatives[i].quiz) {
        continue;
      }

      const pourcentage = await calculerPourcentage(tentatives[i].score, tentatives[i].quiz._id);
      tentativesAvecPourcentage.push({
        quiz: tentatives[i].quiz,
        pourcentage: pourcentage,
      });
    }

    let coursesCompleted = 0;
    for (let i = 0; i < inscriptions.length; i++) {
      if (inscriptions[i].status === "completed") {
        coursesCompleted = coursesCompleted + 1;
      }
    }

    // Avg Grade : meme formule centralisee que My Courses / Teacher / Admin
    const avgGrade = await gradeService.calculerAvgGrade(studentId);

    // Grade History reste base sur les notes de quiz (utile pour voir l evolution des scores)
    const compteurParQuiz = {};
    const gradeHistory = [];

    for (let i = 0; i < tentativesAvecPourcentage.length; i++) {
      const titreDuQuiz = tentativesAvecPourcentage[i].quiz.title;

      if (compteurParQuiz[titreDuQuiz] === undefined) {
        compteurParQuiz[titreDuQuiz] = 0;
      }
      compteurParQuiz[titreDuQuiz] = compteurParQuiz[titreDuQuiz] + 1;

      gradeHistory.push({
        label: titreDuQuiz + " " + compteurParQuiz[titreDuQuiz],
        score: tentativesAvecPourcentage[i].pourcentage,
      });
    }

    const courses = [];

    for (let i = 0; i < inscriptions.length; i++) {
      const inscriptionActuelle = inscriptions[i];

      const tentativesDeCeCours = [];
      for (let j = 0; j < tentativesAvecPourcentage.length; j++) {
        const quizActuel = tentativesAvecPourcentage[j].quiz;
        if (quizActuel && quizActuel.course && inscriptionActuelle.course) {
          if (quizActuel.course._id.toString() === inscriptionActuelle.course._id.toString()) {
            tentativesDeCeCours.push(tentativesAvecPourcentage[j]);
          }
        }
      }

      let moyenneDuCours = 0;
      if (tentativesDeCeCours.length > 0) {
        let somme = 0;
        for (let j = 0; j < tentativesDeCeCours.length; j++) {
          somme = somme + tentativesDeCeCours[j].pourcentage;
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