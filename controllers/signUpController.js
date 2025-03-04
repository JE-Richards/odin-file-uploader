// =========================
// SIGN-UP CONTROLLER
// =========================
// This controller handles user registration by validating form input,
// creating a new user in the database, and handling errors appropriately.
// It interacts with the validation layer, user service, and error-handling
// utilities.
//
// Sections:
// 1. Setup
// 2. Controller Functions
//    2.1. getSignUpPage
//    2.2. postSignUp
// 3. Export
// =========================

// =========================
// 1. SETUP
// =========================
const { validationResult } = require("express-validator");
const validateSignUp = require("../validators/signUpValidator");
const asyncHandler = require("express-async-handler");
const { createUser } = require("../services/userService");
const ValidationError = require("../errors/ValidationError");

// =========================
// 2. CONTROLLER FUNCTIONS
// =========================
// =========================
// 2.1. GETSIGNUPPAGE
// =========================
// Renders the sign-up page, displaying an empty form with no errors.
// =========================
const getSignUpPage = (req, res, next) => {
  res.render("entry", {
    title: "Sign up - Odin's Archive",
    formData: {},
    errors: [],
    formType: "signup",
    validationScript: "/scripts/signUpValidation.js",
  });
};

// =========================
// 2.2. POSTSIGNUP
// =========================
// Handles sign-up form submissions:
// - Validates form input using express-validator.
// - Attempts to create a new user via the user service.
// - Handles validation errors and database errors gracefully.
// - Redirects to the homepage on success or re-renders the form on failure.
// =========================
const postSignUp = [
  validateSignUp,
  asyncHandler(async (req, res, next) => {
    // check for errors from server-side validation layer
    const errors = validationResult(req);
    let formErrors = [];

    if (!errors.isEmpty()) {
      formErrors = errors.array();
      return res.status(400).render("entry", {
        title: "Sign up - Odin's Archive",
        errors: formErrors,
        formData: req.body,
        formType: "signup",
        validationScript: "/scripts/signUpValidation.js",
      });
    }

    // DB query process
    try {
      await createUser(req.body);
      res.redirect("/login");
    } catch (err) {
      if (err instanceof ValidationError) {
        formErrors.push({ msg: err.message });
        return res.status(400).render("entry", {
          title: "Sign up - Odin's Archive",
          errors: formErrors,
          formData: req.body,
          formType: "signup",
          validationScript: "/scripts/signUpValidation.js",
        });
      }

      next(err);
    }
  }),
];

// =========================
// 3. EXPORT
// =========================
module.exports = { getSignUpPage, postSignUp };
