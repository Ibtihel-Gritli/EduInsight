// ============================================================
// routes/teacherRoutes.js
// ============================================================

const express = require("express");
const router = express.Router();
const teacherController = require("../controllers/teacherController");

router.post("/ajouter", teacherController.ajouterTeacher);
router.get("/list", teacherController.listerTeachers);
router.post("/:id/creer-cours", teacherController.creerCoursParTeacher);

module.exports = router;