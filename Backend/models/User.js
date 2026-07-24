// ============================================================
// models/User.js
// Modele User (Abstract) + discriminators Admin, Teacher, Student
// ============================================================

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "teacher", "student"], required: true },
    phone: { type: String },
    avatar: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    discriminatorKey: "role",
  }
);

// Hash automatique du mot de passe avant sauvegarde
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.login = async function (motDePasseFourni) {
  const motDePasseCorrect = await bcrypt.compare(motDePasseFourni, this.password);
  if (!motDePasseCorrect) {
    throw new Error("Email ou mot de passe incorrect");
  }
  return this;
};

userSchema.methods.logout = function () {
  console.log("Utilisateur deconnecte : " + this.email);
};

userSchema.methods.updateProfile = async function (data) {
  if (data.lastName) {
    this.lastName = data.lastName;
  }
  if (data.phone) {
    this.phone = data.phone;
  }
  if (data.avatar) {
    this.avatar = data.avatar;
  }
  await this.save();
  return this;
};

userSchema.methods.changePassword = async function (current, nouveauMotDePasse) {
  const ancienCorrect = await bcrypt.compare(current, this.password);
  if (!ancienCorrect) {
    throw new Error("Mot de passe actuel incorrect");
  }
  this.password = nouveauMotDePasse;
  await this.save();
};

const User = mongoose.model("User", userSchema);

const adminSchema = new mongoose.Schema({
  permissions: { type: [String], default: [] },
});

adminSchema.methods.createUser = async function (data) {
  const nouvelUser = new User(data);
  await nouvelUser.save();
  return nouvelUser;
};

const Admin = User.discriminator("admin", adminSchema);

const teacherSchema = new mongoose.Schema({
  speciality: { type: String },
  office: { type: String },
  department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
});

teacherSchema.methods.createCourse = async function (data) {
  const Course = mongoose.model("Course");
  data.teacher = this._id;
  const nouveauCours = new Course(data);
  await nouveauCours.save();
  return nouveauCours;
};

const Teacher = User.discriminator("teacher", teacherSchema);

const studentSchema = new mongoose.Schema({
  studentCode: { type: String, unique: true, sparse: true },
  level: { type: String },
  group: { type: String },
  department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  enrollmentDate: { type: Date, default: Date.now },
});

studentSchema.methods.enrollCourse = async function (courseId) {
  const Inscription = mongoose.model("Inscription");
  const nouvelleInscription = new Inscription({
    student: this._id,
    course: courseId,
    status: "active",
  });
  await nouvelleInscription.save();
  return nouvelleInscription;
};

const Student = User.discriminator("student", studentSchema);

module.exports = { User, Admin, Teacher, Student };