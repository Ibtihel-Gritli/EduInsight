// ============================================================
// middlewares/authMiddleware.js
// Verifie que la requete a un token JWT valide
// ============================================================

const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Acces non autorise" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (error) {
    console.log("ERREUR JWT :", error.message); // <- ligne ajoutee temporairement
    res.status(401).json({ message: "Token invalide", detail: error.message }); // <- affiche le detail
  }
};

module.exports = protect;