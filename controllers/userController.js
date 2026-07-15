// ============================================================
// controllers/userController.js
// Gere uniquement le CRUD des utilisateurs (pas la connexion)
// ============================================================

const { User } = require("../models/User");

exports.ajouterUtilisateur = async (req, res) => {
  try {
    const nouvelUser = new User(req.body);
    await nouvelUser.save();
    res.status(201).json(nouvelUser);
  } catch (err) {
    res.status(400).json({ message: "Erreur d ajout", error: err.message });
  }
};

exports.listerUtilisateurs = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUtilisateurById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouve" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Erreur", error: err.message });
  }
};

exports.updateUtilisateur = async (req, res) => {
  try {
    const userMisAJour = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!userMisAJour) {
      return res.status(404).json({ message: "Utilisateur non trouve" });
    }
    res.json(userMisAJour);
  } catch (err) {
    res.status(400).json({ message: "Erreur de mise a jour", error: err.message });
  }
};

exports.deleteUtilisateur = async (req, res) => {
  try {
    const userSupprime = await User.findByIdAndDelete(req.params.id);
    if (!userSupprime) {
      return res.status(404).json({ message: "Utilisateur non trouve" });
    }
    res.json({ message: "Utilisateur supprime avec succes" });
  } catch (err) {
    res.status(500).json({ message: "Erreur de suppression", error: err.message });
  }
};