// ============================================================
// routes/studentRoutes.js
// ============================================================

const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
const protect = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");

// Creer un student : reste libre (comme un register)
router.post("/ajouter", studentController.ajouterStudent);

// Lister les students : protege, admin et teacher peuvent voir
router.get("/list", protect, authorize(["admin", "teacher"]), studentController.listerStudents);

// Un student s inscrit a un cours : protege, seulement student
router.post(
  "/:id/inscrire-cours",
  protect,
  authorize(["student"]),
  studentController.inscrireStudentACours
);

router.put("/:id", studentController.updateStudent);
router.delete("/:id", studentController.deleteStudent);

router.get("/:id/mes-cours", studentController.mesCours);
module.exports = router;