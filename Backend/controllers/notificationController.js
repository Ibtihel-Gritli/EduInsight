// Notification + Recommendation

const Notification = require("../models/Notification");
const Recommendation = require("../models/Recommendation");

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notif = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!notif) {
      return res.status(404).json({ message: "Notification non trouvee" });
    }
    res.json(notif);
  } catch (err) {
    res.status(400).json({ message: "Erreur", error: err.message });
  }
};

exports.getRecommendations = async (req, res) => {
  try {
    const recommendations = await Recommendation.find({ student: req.user.id });
    res.json(recommendations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};