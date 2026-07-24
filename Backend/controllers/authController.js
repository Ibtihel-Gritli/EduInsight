const { User } = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Inscription
exports.register = async (req, res) => {
  const lastName = req.body.lastName;
  const email = req.body.email;
  const password = req.body.password;
  const role = req.body.role;

  try {
    const userExiste = await User.findOne({ email: email });
    if (userExiste) {
      return res.status(400).json({ message: "Utilisateur deja existant" });
    }

    await User.create({
      lastName: lastName,
      email: email,
      password: password,
      role: role,
    });

    res.status(201).json({ message: "Inscription reussie" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Connexion
exports.login = async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({ message: "Identifiants invalides" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Identifiants invalides" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token: token,
      user: {
        id: user._id,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Deconnexion
exports.logout = async (req, res) => {
  res.json({ message: "Deconnexion reussie" });
};

// Mise a jour du profil 
// req.user.id vient du token, ajoute par le middleware protect
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouve" });
    }
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Changement de mot de passe
exports.changePassword = async (req, res) => {
  try {
    const currentPassword = req.body.currentPassword;
    const newPassword = req.body.newPassword;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouve" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mot de passe actuel incorrect" });
    }

    user.password = newPassword; // sera re-hashe automatiquement par le pre-save de User.js
    await user.save();

    res.json({ message: "Mot de passe mis a jour" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};