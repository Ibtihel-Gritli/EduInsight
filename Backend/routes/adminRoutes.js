// ============================================================
// routes/adminRoutes.js
// ============================================================

const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const protect = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");

// Creer un admin : reste libre (comme un register)
router.post("/ajouter", adminController.ajouterAdmin);

// Lister les admins : protege, seulement pour un admin connecte
router.get("/list", protect, authorize(["admin"]), adminController.listerAdmins);

// Un admin cree un utilisateur : protege, seulement admin
router.post(
  "/:id/creer-utilisateur",
  protect,
  authorize(["admin"]),
  adminController.creerUtilisateurParAdmin
);

module.exports = router;