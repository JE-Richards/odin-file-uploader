const { Router } = require("express");
const loginController = require("../controllers/loginController");

const loginRouter = () => {
  const router = Router();

  router.get("/", loginController.getLoginPage);

  router.post("/", loginController.postLogin);

  return router;
};

module.exports = loginRouter;
