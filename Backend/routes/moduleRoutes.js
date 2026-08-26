const express = require("express");
const router = express.Router();
const moduleController = require("../controllers/moduleController");
const protect = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");

router.get("/course/:courseId", protect, moduleController.getModulesByCourse);

// Toutes les routes ci-dessous sont protegees : reservees a teacher et admin
router.use(protect, authorize(["teacher", "admin"]));

// Routes pour les Modules
router.post("/course/:courseId", moduleController.addModule);
router.put("/:id", moduleController.updateModule);
router.delete("/:id", moduleController.deleteModule);

// Routes pour les Lecons
router.post("/:moduleId/lessons", moduleController.addLesson);
router.put("/lessons/:id", moduleController.updateLesson);
router.delete("/lessons/:id", moduleController.deleteLesson);

module.exports = router;