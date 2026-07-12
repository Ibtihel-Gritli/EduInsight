///// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.post("/ajouter", userController.ajouterUtilisateur);
router.post("/login", userController.loginUtilisateur);
router.get("/list", userController.listerUtilisateurs);
router.get("/:id", userController.getUtilisateurById);
router.put("/:id", userController.updateUtilisateur);
router.delete("/:id", userController.deleteUtilisateur);



module.exports = router;
