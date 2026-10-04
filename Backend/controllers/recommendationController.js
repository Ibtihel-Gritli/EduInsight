// ============================================================
// controllers/recommendationController.js
// ============================================================

const Recommendation = require("../models/Recommendation");
const recommendationService = require("../services/recommendationService");

// Liste les recommandations du student connecte (les regenere avant)
exports.listerMesRecommandations = async function (req, res) {
  try {
    await recommendationService.genererRecommandations(req.user.id);

    const recommandations = await Recommendation.find({ student: req.user.id })
      .populate("course")
      .sort({ createdAt: -1 });

    let nombreNonLues = 0;
    for (let i = 0; i < recommandations.length; i++) {
      if (recommandations[i].isRead === false) {
        nombreNonLues = nombreNonLues + 1;
      }
    }

    res.json({ recommandations: recommandations, unreadCount: nombreNonLues });
  } catch (err) {
    res.status(500).json({ message: "Erreur", error: err.message });
  }
};

// Marque toutes les recommandations du student comme lues
exports.marquerToutesLues = async function (req, res) {
  try {
    await Recommendation.updateMany(
      { student: req.user.id, isRead: false },
      { isRead: true }
    );
    res.json({ message: "Marquees comme lues" });
  } catch (err) {
    res.status(500).json({ message: "Erreur", error: err.message });
  }
};