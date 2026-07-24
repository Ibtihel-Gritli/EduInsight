const express = require("express");
const router = express.Router();
const departmentController = require("../controllers/departmentController");
const protect = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");

// Voir les departements : libre pour tout le monde
router.get("/", departmentController.getDepartments);

// Gerer les departements : reserve a l admin
router.post("/", protect, authorize(["admin"]), departmentController.createDepartment);
router.put("/:id", protect, authorize(["admin"]), departmentController.updateDepartment);
router.delete("/:id", protect, authorize(["admin"]), departmentController.deleteDepartment);

module.exports = router;