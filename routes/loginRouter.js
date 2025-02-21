const { Router } = require("express");
const loginController = require("../controllers/loginController");

const loginRouter = () => {
  const router = Router();

  router.get("/", loginController.getLogin);

  return router;
};

module.exports = loginRouter;
