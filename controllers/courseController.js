// ============================================================
// controllers/courseController.js
// ============================================================

const Course = require("../models/Course");
const courseService = require("../services/courseService");

exports.ajouterCours = async (req, res) => {
  try {
    const nouveauCours = await courseService.creerCours(req.body);
    res.status(201).json(nouveauCours);
  } catch (err) {
    res.status(400).json({ message: "Erreur d ajout", error: err.message });
  }
};

// Ajouter un cours AVEC une image (comme le prof : direct, sans service)
exports.ajouterCoursAvecImage = async (req, res) => {
  try {
    const nouveauCours = new Course({
      title: req.body.title,
      description: req.body.description,
      level: req.body.level,
      duration: req.body.duration,
      image: req.file ? req.file.filename : null,
    });

    await nouveauCours.save();
    res.status(201).json(nouveauCours);
  } catch (err) {
    res.status(400).json({ message: "Erreur d ajout", error: err.message });
  }
};

exports.listerCours = async (req, res) => {
  try {
    const cours = await courseService.listerCours();
    res.json(cours);
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