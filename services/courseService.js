// ============================================================
// services/courseService.js
// Logique metier pour les cours
// ============================================================

const Course = require("../models/Course");

// Creer un cours (sans image)
exports.creerCours = async (data) => {
  const nouveauCours = new Course(data);
  await nouveauCours.save();
  return nouveauCours;
};

// Creer un cours avec une image (optionnelle)
exports.creerCoursAvecImage = async (data, fichier) => {
  // si un fichier a ete envoye, on ajoute son nom dans data.image
  if (fichier) {
    data.image = fichier.filename;
  }

  const nouveauCours = new Course(data);
  await nouveauCours.save();
  return nouveauCours;
};

// Lister tous les cours
exports.listerCours = async () => {
  const cours = await Course.find();
  return cours;
};

// Recuperer un cours par id
exports.getCoursParId = async (id) => {
  const cours = await Course.findById(id);
  return cours;
};

// Mettre a jour un cours
exports.updateCours = async (id, data) => {
  const coursMisAJour = await Course.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  return coursMisAJour;
};

// Supprimer un cours
exports.deleteCours = async (id) => {
  const coursSupprime = await Course.findByIdAndDelete(id);
  return coursSupprime;
};

// Ajouter un module a un cours (utilise la methode addModule() du model)
exports.ajouterModule = async (courseId, data) => {
  const cours = await Course.findById(courseId);
  if (!cours) {
    throw new Error("Cours non trouve");
  }
  const nouveauModule = await cours.addModule(data);
  return nouveauModule;
};