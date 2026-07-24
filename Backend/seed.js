// ============================================================
// seed.js
// Remplit la base de donnees avec des donnees de test
// Respecte la structure existante du projet (CommonJS)
// ============================================================

const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const Department = require("./models/Department");
const { User, Admin, Teacher, Student } = require("./models/User");
const Course = require("./models/Course");
const Module = require("./models/Module");
const Lesson = require("./models/Lesson");
const Quiz = require("./models/Quiz");
const Question = require("./models/Question");
const Choice = require("./models/Choice");

const MONGO_URI = process.env.MONGO_URI;

const seedDatabase = async () => {
  try {
    // 1. Connexion a MongoDB
    await mongoose.connect(MONGO_URI);
    console.log("Connecte a MongoDB pour le seeding...");

    // 2. Nettoyage des anciennes donnees
    await Department.deleteMany({});
    await User.deleteMany({});
    await Course.deleteMany({});
    await Module.deleteMany({});
    await Lesson.deleteMany({});
    await Quiz.deleteMany({});
    await Question.deleteMany({});
    await Choice.deleteMany({});
    console.log("Anciennes donnees supprimees.");

    // 3. Creation du departement
    // (pas besoin de hasher le mot de passe a la main :
    // le pre-save de User.js le fait deja automatiquement pour chaque utilisateur)
    const department = await Department.create({
      name: "Informatique et Technologies",
      description: "Departement genie logiciel et developpement web",
    });
    console.log("Departement cree.");

    // 4. Creation des utilisateurs (Admin, Teacher, Student)
    const admin = await Admin.create({
      lastName: "System",
      email: "admin@eduinsight.com",
      password: "Password123!",
      role: "admin",
      permissions: ["ALL_PERMISSIONS"],
    });

    const teacher = await Teacher.create({
      lastName: "Dev",
      email: "teacher@eduinsight.com",
      password: "Password123!",
      role: "teacher",
      speciality: "MERN Stack et Web Dev",
      office: "B-204",
      department: department._id,
    });

    const student = await Student.create({
      lastName: "Ben",
      email: "student@eduinsight.com",
      password: "Password123!",
      role: "student",
      studentCode: "ETU2026001",
      level: "Licence 2",
      group: "G1",
      department: department._id,
    });

    console.log("Utilisateurs crees (Admin, Teacher, Student).");

    // 5. Creation d un cours
    const course = await Course.create({
      title: "Developpement Web avec la Stack MERN",
      description: "Apprenez a concevoir des applications full-stack modernes avec React et Express.",
      department: department._id,
      teacher: teacher._id,
      duration: "30h",
      level: "Intermediaire",
    });

    console.log("Cours cree.");

    // 6. Creation d un module et d une lecon
    const module1 = await Module.create({
      title: "Module 1 : Introduction a Node.js et Express",
      description: "Bases du serveur backend",
      order: 1,
      course: course._id,
    });

    await Lesson.create({
      title: "Lecon 1 : Creation du serveur Express",
      content: "<h1>Bienvenue dans Express</h1><p>Explication des routes et controleurs...</p>",
      order: 1,
      module: module1._id,
    });

    console.log("Module et Lecon crees.");

    // 7. Creation d un quiz avec une question et 3 choix
    const quiz = await Quiz.create({
      course: course._id,
      title: "Quiz 1 : Notions de base Express.js",
      description: "Test sur les middlewares et le routage",
      duration: 15,
      passingScore: 60,
      isPublished: true,
      createdBy: teacher._id,
    });

    const question1 = await Question.create({
      quiz: quiz._id,
      statement: "Quel middleware permet de parser le JSON dans Express ?",
      type: "MCQ",
      points: 2,
      order: 1,
    });

    await Choice.create([
      { question: question1._id, text: "express.json()", isCorrect: true, order: 1 },
      { question: question1._id, text: "express.parse()", isCorrect: false, order: 2 },
      { question: question1._id, text: "body.json()", isCorrect: false, order: 3 },
    ]);

    console.log("Quiz, Question et Choix crees.");

    console.log("");
    console.log("Seeding termine avec succes !");
    console.log("");
    console.log("Identifiants de test :");
    console.log("Admin : admin@eduinsight.com / Password123!");
    console.log("Teacher : teacher@eduinsight.com / Password123!");
    console.log("Student : student@eduinsight.com / Password123!");

    process.exit(0);
  } catch (error) {
    console.error("Erreur durant le seeding :", error);
    process.exit(1);
  }
};

seedDatabase();