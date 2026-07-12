const mongoose = require("mongoose");

// Schema de base User
const userSchema = new mongoose.Schema(
  {
    // _id: ObjectId -> genere automatiquement par MongoDB/Mongoose
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "teacher", "student"], required: true },
    phone: { type: String},
    avatar: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true, // ajoute automatiquement createdAt + updatedAt
    discriminatorKey: "role",
  }
);

//login():
userSchema.methods.login = async function (motDePasse) {
  if (motDePasse!== this.password) {
    throw new Error("Email ou mot de passe incorrect");
  }
  return this;
};

//logout()
userSchema.methods.logout = function () {
  console.log("Utilisateur deconnecte : " + this.email);
};

//updateProfile(data)
userSchema.methods.updateProfile = async function (data) {
  if (data.firstName) {
    this.firstName = data.firstName;
  }
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

//changePassword(current, new)
userSchema.methods.changePassword = async function (current, nouveauMotDePasse) {
  if (current !== this.password) {
    throw new Error("Mot de passe actuel incorrect");
  }
  this.password = nouveauMotDePasse;
  await this.save();
};

const User = mongoose.model("User", userSchema);

//Admin
const adminSchema = new mongoose.Schema({
  permissions: {
    type: [String],
    default: [],
  },
});

adminSchema.methods.createUser = async function (data) {
  const nouvelUser = new User(data);
  await nouvelUser.save();
  return nouvelUser;
};

const Admin = User.discriminator("admin", adminSchema);

//Teacher
const teacherSchema = new mongoose.Schema({
  speciality: { type: String},
  office: { type: String},
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
  },
});

teacherSchema.methods.createCourse = async function (data) {
  const Course = mongoose.model("Course");
  data.teacher = this._id;
  const nouveauCours = new Course(data);
  await nouveauCours.save();
  return nouveauCours;
};

const Teacher = User.discriminator("teacher", teacherSchema);

// Student
const studentSchema = new mongoose.Schema({
  studentCode: {
    type: String,
    unique: true,
    sparse: true,
  },
  level: { type: String},
  group: { type: String},
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
  },
  enrollmentDate: {
    type: Date,
    default: Date.now,
  },
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