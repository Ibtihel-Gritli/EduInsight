// ============================================================
// routes/teacherRoutes.js
// ============================================================

const express = require("express");
const router = express.Router();
const teacherController = require("../controllers/teacherController");
const protect = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");

// Creer un teacher : reste libre (comme un register)
router.post("/ajouter", teacherController.ajouterTeacher);

// Lister les teachers : protege, admin et teacher peuvent voir
router.get("/list", protect, authorize(["admin", "teacher"]), teacherController.listerTeachers);

// Un teacher cree un cours : protege, seulement teacher (et admin)
router.post(
  "/:id/creer-cours",
  protect,
  authorize(["teacher", "admin"]),
  teacherController.creerCoursParTeacher
);

module.exports = router;