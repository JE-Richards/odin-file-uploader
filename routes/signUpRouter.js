const { Router } = require("express");
const signUpController = require("../controllers/signUpController");

const signUpRouter = () => {
  const router = Router();

  router.get("/", signUpController.getSignUpPage);

  router.post("/", signUpController.postSignUp);

  return router;
};

module.exports = signUpRouter;
