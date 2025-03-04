// =========================
// LOGIN CONTROLLER
// =========================
// This controller handles the logic for the user login process, including
// rendering the login page and processing the login form submission.
// It interacts with the validation layer, handles potential validation errors,
// and Passport for authentication.
//
// Sections:
// 1. Setup
// 2. Controller Functions
//    2.1. getLoginPage
//    2.2. postLogin
// 3. Export
// =========================

// =========================
// 1. SETUP
// =========================
const passport = require("passport");
const asyncHandler = require("express-async-handler");
const validateLogin = require("../validators/loginValidator");
const { validationResult } = require("express-validator");

// =========================
// 2. CONTROLLER FUNCTIONS
// =========================
// =========================
// 2.1. GETLOGINPAGE
// =========================
// Renders the entry page with the login form and no errors.
// =========================
const getLoginPage = (req, res, next) => {
  res.render("entry", {
    title: "Login - Odin's Archive",
    formData: {},
    errors: [],
    formType: "login",
    validationScript: "/scripts/loginValidation.js",
  });
};

// =========================
// 2.2. POSTLOGIN
// =========================
// Handles login form submissions:
// - Validates user input using `loginValidator`.
// - If validation errors exist, re-render the login form with the errors.
// - Uses Passport to authenticate the user with the defined local strategy.
// - Handles authentication errors and unsuccessful login attempts.
// - If authentication is successful, logs in the user and redirects to homepage.
// =========================
const postLogin = [
  validateLogin,
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    let formErrors = [];

    if (!errors.isEmpty()) {
      formErrors = errors.array();
      return res.status(404).render("entry", {
        title: "Login - Odin's Archive",
        formData: req.body,
        errors: formErrors,
        formType: "login",
        validationScript: "/scripts/loginValidation.js",
      });
    }

    passport.authenticate("local", async (err, user, info) => {
      if (err) {
        return next(err);
      }

      console.log(info);

      // If no user or any other errors
      if (!user) {
        formErrors.push({
          msg: info.message || "Invalid username or password.",
        });

        return res.status(401).render("entry", {
          title: "Login - Odin's Archive",
          formData: req.body,
          errors: formErrors,
          formType: "login",
          validationScript: "/scripts/loginValidation.js",
        });
      }

      // If login successful
      req.logIn(user, async (err) => {
        if (err) {
          return next(err);
        }

        return res.redirect("/");
      });
    })(req, res, next);
  }),
];

// =========================
// 3. EXPORT
// =========================
module.exports = { getLoginPage, postLogin };
