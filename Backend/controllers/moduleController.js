// Gere les Modules et les Lecons

const Module = require("../models/Module");
const Lesson = require("../models/Lesson");

// ---------- Module ----------

exports.addModule = async (req, res) => {
  try {
    const data = req.body;
    data.course = req.params.courseId;
    const nouveauModule = await Module.create(data);
    res.status(201).json(nouveauModule);
  } catch (err) {
    res.status(400).json({ message: "Erreur d ajout", error: err.message });
  }
};

exports.updateModule = async (req, res) => {
  try {
    const nouveauModule = await Module.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!nouveauModule) {
      return res.status(404).json({ message: "Module non trouve" });
    }
    res.json(nouveauModule);
  } catch (err) {
    res.status(400).json({ message: "Erreur de mise a jour", error: err.message });
  }
};

exports.deleteModule = async (req, res) => {
  try {
    const moduleSupprime = await Module.findByIdAndDelete(req.params.id);
    if (!moduleSupprime) {
      return res.status(404).json({ message: "Module non trouve" });
    }
    res.json({ message: "Module supprime" });
  } catch (err) {
    res.status(500).json({ message: "Erreur de suppression", error: err.message });
  }
};

// ---------- Lesson ----------

exports.addLesson = async (req, res) => {
  try {
    const data = req.body;
    data.module = req.params.moduleId;
    const nouvelleLesson = await Lesson.create(data);
    res.status(201).json(nouvelleLesson);
  } catch (err) {
    res.status(400).json({ message: "Erreur d ajout", error: err.message });
  }
};

exports.updateLesson = async (req, res) => {
  try {
    const lecon = await Lesson.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!lecon) {
      return res.status(404).json({ message: "Lecon non trouvee" });
    }
    res.json(lecon);
  } catch (err) {
    res.status(400).json({ message: "Erreur de mise a jour", error: err.message });
  }
};

exports.deleteLesson = async (req, res) => {
  try {
    const leconSupprimee = await Lesson.findByIdAndDelete(req.params.id);
    if (!leconSupprimee) {
      return res.status(404).json({ message: "Lecon non trouvee" });
    }
    res.json({ message: "Lecon supprimee" });
  } catch (err) {
    res.status(500).json({ message: "Erreur de suppression", error: err.message });
  }
};