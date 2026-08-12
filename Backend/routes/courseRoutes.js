// ============================================================
// routes/courseRoutes.js
// ============================================================

const express = require("express");
const router = express.Router();
const courseController = require("../controllers/courseController");
const upload = require("../middlewares/upload");
const protect = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");

// Ajouter un cours : protege, seulement teacher et admin
router.post("/ajouter", protect, authorize(["teacher", "admin"]), courseController.ajouterCours);

// Ajouter un cours avec image : protege, seulement teacher et admin
router.post(
  "/ajouter-avec-image",
  protect,
  authorize(["teacher", "admin"]),
  upload.single("pdf"),
  courseController.ajouterCoursAvecImage
);

// Lister les cours : libre, tout le monde peut voir (meme sans compte)
router.get("/list", courseController.listerCours);
router.get("/:id", courseController.getCoursById);

// Modifier / supprimer un cours : protege, seulement teacher et admin
router.put("/:id", protect, authorize(["teacher", "admin"]), courseController.updateCours);
router.delete("/:id", protect, authorize(["teacher", "admin"]), courseController.deleteCours);

router.post("/:id/ajouter-module", protect, authorize(["teacher", "admin"]), courseController.ajouterModule);

module.exports = router;