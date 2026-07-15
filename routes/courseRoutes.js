// ============================================================
// routes/courseRoutes.js
// ============================================================

const express = require("express");
const router = express.Router();
const courseController = require("../controllers/courseController");
const upload = require("../middlewares/upload");

router.post("/ajouter", courseController.ajouterCours);
router.post("/ajouter-avec-image", upload.single("image"), courseController.ajouterCoursAvecImage);
router.get("/list", courseController.listerCours);
router.get("/:id", courseController.getCoursById);
router.put("/:id", courseController.updateCours);
router.delete("/:id", courseController.deleteCours);
router.post("/:id/ajouter-module", courseController.ajouterModule);

module.exports = router;