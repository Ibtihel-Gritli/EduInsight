// config/db.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connexion MongoDB réussie");
  } catch (err) {
    console.error("❌ Erreur de connexion MongoDB :", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
