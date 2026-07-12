const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");

router.post("/ajouter", studentController.ajouterStudent);
router.get("/list", studentController.listerStudents);
router.post("/:id/inscrire-cours", studentController.inscrireStudentACours);

module.exports = router;