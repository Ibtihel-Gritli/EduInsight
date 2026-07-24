const { Admin } = require("../models/User");

// Creer un Admin
exports.ajouterAdmin = async (req, res) => {
  try {
    const nouvelAdmin = new Admin(req.body);
    await nouvelAdmin.save();
    res.status(201).json(nouvelAdmin);
  } catch (err) {
    res.status(400).json({ message: "Erreur d ajout admin", error: err.message });
  }
};

// Lister tous les Admins
exports.listerAdmins = async (req, res) => {
  try {
    const admins = await Admin.find();
    res.json(admins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Un admin cree un utilisateur
exports.creerUtilisateurParAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin non trouve" });
    }
    const nouvelUser = await admin.createUser(req.body);
    res.status(201).json(nouvelUser);
  } catch (err) {
    res.status(400).json({ message: "Erreur", error: err.message });
  }
};