// ============================================================
// services/recommendationService.js
// Algorithme deterministe : niveau + similarite de mots-cles
// entre le cours candidat et les cours deja suivis par le student
// ============================================================

const { Student } = require("../models/User");
const Course = require("../models/Course");
const Inscription = require("../models/Inscription");
const Recommendation = require("../models/Recommendation");

// Mots trop courants pour etre consideres comme des mots-cles utiles
const MOTS_VIDES = [
  "de", "le", "la", "les", "des", "et", "a", "au", "aux", "du", "un", "une",
  "pour", "dans", "sur", "avec", "the", "and", "for", "with", "of", "to",
  "in", "on", "ce", "cette", "est", "sont", "vos", "votre", "qui", "que",
];

// Transforme un texte en un ensemble de mots-cles (minuscules, sans doublons, sans mots vides)
function extraireMotsCles(texte) {
  if (!texte) {
    return new Set();
  }

  const mots = texte
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ") // enleve la ponctuation
    .split(/\s+/)
    .filter(function (mot) {
      return mot.length >= 3 && MOTS_VIDES.indexOf(mot) === -1;
    });

  return new Set(mots);
}

// Calcule le pourcentage de similarite entre 2 ensembles de mots-cles (indice de Jaccard)
function calculerSimilarite(ensembleA, ensembleB) {
  if (ensembleA.size === 0 || ensembleB.size === 0) {
    return 0;
  }

  let motsCommuns = 0;
  ensembleA.forEach(function (mot) {
    if (ensembleB.has(mot)) {
      motsCommuns = motsCommuns + 1;
    }
  });

  const tailleUnion = new Set([...ensembleA, ...ensembleB]).size;
  return motsCommuns / tailleUnion; // valeur entre 0 et 1
}

// Calcule le score final (0 a 100) pour un cours candidat, pour un student donne
function calculerScore(coursCandidat, motsClesDuProfil) {
  const motsClesCandidat = extraireMotsCles(coursCandidat.title + " " + coursCandidat.description);

  const similarite = calculerSimilarite(motsClesCandidat, motsClesDuProfil);

  // 30% garanti car le niveau correspond deja (filtre applique avant l appel)
  // + jusqu a 70% de plus selon la similarite de mots-cles avec le profil du student
  let score = 30 + Math.round(similarite * 70);

  if (score > 100) {
    score = 100;
  }

  return score;
}

exports.genererRecommandations = async function (studentId) {
  const student = await Student.findById(studentId);

  if (!student || !student.level) {
    return;
  }

  const coursDuNiveau = await Course.find({ level: student.level });

  const inscriptions = await Inscription.find({ student: studentId }).populate("course");

  // on retire les inscriptions dont le cours a ete supprime
  const inscriptionsValides = inscriptions.filter(function (i) {
    return i.course !== null;
  });

  const idsCoursInscrits = inscriptionsValides.map(function (i) {
    return i.course._id.toString();
  });

  let texteDuProfil = "";
  for (let i = 0; i < inscriptionsValides.length; i++) {
    const coursSuivi = inscriptionsValides[i].course;
    texteDuProfil = texteDuProfil + " " + coursSuivi.title + " " + coursSuivi.description;
  }
  const motsClesDuProfil = extraireMotsCles(texteDuProfil);

  for (let i = 0; i < coursDuNiveau.length; i++) {
    const cours = coursDuNiveau[i];

    if (idsCoursInscrits.indexOf(cours._id.toString()) !== -1) {
      continue;
    }

    const score = calculerScore(cours, motsClesDuProfil);

    const message = "La course " + cours.title + " correspond a votre niveau " +
      student.level + " et complete votre parcours.";

    await Recommendation.findOneAndUpdate(
      { student: studentId, course: cours._id },
      {
        $set: {
          message: message,
          confidenceScore: score,
          type: "course",
        },
        $setOnInsert: {
          isRead: false,
        },
      },
      { upsert: true, new: true }
    );
  }

  await Recommendation.deleteMany({
    student: studentId,
    course: { $in: idsCoursInscrits },
  });
};