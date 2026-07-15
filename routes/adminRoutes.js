// ============================================================
// routes/adminRoutes.js
// ============================================================

const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const protect = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");

router.post("/ajouter", adminController.ajouterAdmin);
router.get("/list", adminController.listerAdmins);

// Route protegee : besoin d un token + role admin
router.post(
  "/:id/creer-utilisateur",
  protect,
  authorize(["admin"]),
  adminController.creerUtilisateurParAdmin
);

module.exports = router;