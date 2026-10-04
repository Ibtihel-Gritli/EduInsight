// ============================================================
// services/gradeService.js
// Calcul centralise du "Avg Grade" (taux d avancement moyen)
// utilise par Student, Teacher et Admin pour afficher le meme chiffre partout
// ============================================================

const Inscription = require("../models/Inscription");
const QuizAttempt = require("../models/QuizAttempt");
const Quiz = require("../models/Quiz");

// Calcule le taux d avancement moyen d un student :
// pour chaque cours inscrit, (quiz differents faits / total quiz du cours) x 100,
// puis moyenne sur tous les cours inscrits.
//
// idsDesCoursAutorises (optionnel) : si fourni, ne regarde QUE les inscriptions
// a ces cours precis (utilise par le teacher, qui ne doit voir que SES cours)
exports.calculerAvgGrade = async function (studentId, idsDesCoursAutorises) {
  const filtreInscription = { student: studentId };
  if (idsDesCoursAutorises) {
    filtreInscription.course = { $in: idsDesCoursAutorises };
  }

  const inscriptions = await Inscription.find(filtreInscription).populate("course");

  const tentatives = await QuizAttempt.find({
    student: studentId,
    submittedAt: { $ne: null },
  }).populate("quiz");

  let sommeAvancement = 0;
  let compteCours = 0;

  for (let i = 0; i < inscriptions.length; i++) {
    const inscriptionActuelle = inscriptions[i];
    if (!inscriptionActuelle.course) {
      continue;
    }

    const quizzesDuCours = await Quiz.find({ course: inscriptionActuelle.course._id });
    const idsDesQuiz = quizzesDuCours.map(function (q) {
      return q._id.toString();
    });

    const quizFaitsPourCeCours = [];
    for (let j = 0; j < tentatives.length; j++) {
      if (!tentatives[j].quiz) {
        continue;
      }
      const idQuizDeLaTentative = tentatives[j].quiz._id.toString();
      if (idsDesQuiz.indexOf(idQuizDeLaTentative) !== -1) {
        if (quizFaitsPourCeCours.indexOf(idQuizDeLaTentative) === -1) {
          quizFaitsPourCeCours.push(idQuizDeLaTentative);
        }
      }
    }

    let avancementDuCours = 0;
    if (idsDesQuiz.length > 0) {
      avancementDuCours = (quizFaitsPourCeCours.length / idsDesQuiz.length) * 100;
    }

    sommeAvancement = sommeAvancement + avancementDuCours;
    compteCours = compteCours + 1;
  }

  let avgGrade = 0;
  if (compteCours > 0) {
    avgGrade = Math.round(sommeAvancement / compteCours);
  }

  return avgGrade;
};