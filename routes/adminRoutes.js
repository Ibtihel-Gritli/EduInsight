const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

router.post("/ajouter", adminController.ajouterAdmin);
router.get("/list", adminController.listerAdmins);
router.post("/:id/creer-utilisateur", adminController.creerUtilisateurParAdmin);

module.exports = router;