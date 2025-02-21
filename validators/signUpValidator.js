// =========================
// SIGN UP (SERVER-SIDE) VALIDATION
// =========================
// This script defines the server-side validation rules for the sign up form.
// It uses `express-validator` to enforce input requirements and ensure data
// integrity before submission.
//
// Sections:
// 1. Validator
// 2. Export
// =========================

// =========================
// 1. VALIDATOR
// =========================
const { body } = require("express-validator");

const emptyErr = "must not be empty.";

const validateSignUp = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage(`Username ${emptyErr}`)
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters.")
    .isLength({ max: 32 })
    .withMessage("Username must be less than 32 characters.")
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage(
      "Username can only contain letters, numbers, underscores (_), and dashes (-)."
    ),
  body("email")
    .trim()
    .notEmpty()
    .withMessage(`Email ${emptyErr}`)
    .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    .withMessage("Please enter a valid email address (e.g. user@example.com).")
    .isLength({ max: 255 })
    .withMessage("Email must be less than 255 characters."),
  body("password")
    .trim()
    .notEmpty()
    .withMessage(`Password ${emptyErr}`)
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long."),
  body("confirm-password")
    .trim()
    .notEmpty()
    .withMessage(`Confirm password ${emptyErr}`)
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Passwords do not match."),
];

// =========================
// 2. EXPORT
// =========================
module.exports = validateSignUp;
