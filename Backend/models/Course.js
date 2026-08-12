const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department", // le cours appartient a un departement
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // le prof qui a cree le cours
    },
    duration: {
      type: String, 
      trim: true,
    },
    level: {
      type: String,
      trim: true,
    },
    pdfUrl: { type: String, default: "" },
  },
  {
    timestamps: true, // ajoute createdAt et updatedAt automatiquement
  }
);

// Ajoute un nouveau module a ce cours
courseSchema.methods.addModule = async function (data) {
  const Module = mongoose.model("Module");
  data.course = this._id; // on lie le module a ce cours
  const nouveauModule = new Module(data);
  await nouveauModule.save();
  return nouveauModule;
};

// Met a jour les infos du cours
courseSchema.methods.update = async function (data) {
  if (data.title) {
    this.title = data.title;
  }
  if (data.description) {
    this.description = data.description;
  }
  if (data.duration) {
    this.duration = data.duration;
  }
  if (data.level) {
    this.level = data.level;
  }
  if (data.image) {
    this.image = data.image;
  }

  await this.save();
  return this;
};

// Supprime ce cours
courseSchema.methods.delete = async function () {
  await Course.findByIdAndDelete(this._id);
};

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;