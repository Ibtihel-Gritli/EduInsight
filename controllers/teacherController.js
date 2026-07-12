const { Teacher } = require("../models/User");

// Creer un Teacher
exports.ajouterTeacher = async (req, res) => {
  try {
    const nouveauTeacher = new Teacher(req.body);
    await nouveauTeacher.save();
    res.status(201).json(nouveauTeacher);
  } catch (err) {
    res.status(400).json({ message: "Erreur d ajout teacher", error: err.message });
  }
};

// Lister tous les Teachers
exports.listerTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find();
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Un teacher cree un cours
exports.creerCoursParTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher non trouve" });
    }

    const nouveauCours = await teacher.createCourse(req.body);
    res.status(201).json(nouveauCours);
  } catch (err) {
    res.status(400).json({ message: "Erreur", error: err.message });
  }
};