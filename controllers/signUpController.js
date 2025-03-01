const { validationResult } = require("express-validator");
const validateSignUp = require("../validators/signUpValidator");
const asyncHandler = require("express-async-handler");
const { createUser } = require("../services/userService");
const ValidationError = require("../errors/ValidationError");

const getSignUp = (req, res, next) => {
  res.render("entry", {
    title: "Sign up - Odin's Archive",
    formData: {},
    errors: [],
    formType: "signup",
  });
};

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
        });
      }

      next(err);
    }
  }),
];

module.exports = { getSignUp, postSignUp };
