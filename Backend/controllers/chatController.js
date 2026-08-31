const aiService = require("../services/aiService");

exports.envoyerMessage = async function (req, res) {
  try {
    const messageUtilisateur = req.body.message;

    // validation simple : le message ne doit pas etre vide
    if (!messageUtilisateur || messageUtilisateur.trim() === "") {
      return res.status(400).json({ message: "Le message ne peut pas etre vide" });
    }

    // contexte de l utilisateur connecte (rempli par le middleware protect)
    const contexteUtilisateur = {
      lastName: req.user.lastName,
      role: req.user.role,
    };

    const reponseIA = await aiService.demanderReponseIA(messageUtilisateur, contexteUtilisateur);

    res.json({ reply: reponseIA });
  } catch (err) {
    res.status(500).json({ message: "Erreur", error: err.message });
  }
};