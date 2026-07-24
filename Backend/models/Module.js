const mongoose = require("mongoose");

const moduleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    order: { type: Number, default: 0 },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  },
  { timestamps: true }
);

// + addLesson(data): ajoute une lecon a ce module
moduleSchema.methods.addLesson = async function (data) {
  const Lesson = mongoose.model("Lesson");
  data.module = this._id;
  const nouvelleLesson = new Lesson(data);
  await nouvelleLesson.save();
  return nouvelleLesson;
};

module.exports = mongoose.model("Module", moduleSchema);