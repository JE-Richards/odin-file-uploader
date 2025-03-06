// =========================
// LOGOUT CONTROLLER
// =========================
// This handles the logic for the user logout process.
//
// Sections:
// 1. Controller Functions
//     1.1. userLogout
// 2. Export
// =========================

// =========================
// 1. CONTROLLER FUNCTIONS
// =========================
// =========================
// 1.1. USERLOGOUT
// =========================
const userLogout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.session.destroy((err) => {
      if (err) {
        return next(err);
      }
      res.redirect("/login");
    });
  });
};

// =========================
// 2. EXPORT
// =========================
module.exports = { userLogout };
