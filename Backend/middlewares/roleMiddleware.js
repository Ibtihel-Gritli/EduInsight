// ============================================================
// middlewares/roleMiddleware.js
// Verifie que l utilisateur a le bon role
// ============================================================

const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Acces refuse" });
    }
    next();
  };
};

module.exports = authorize;