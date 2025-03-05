const { Router } = require("express");
const logoutController = require("../controllers/logoutController");

const logoutRouter = () => {
  const router = Router();

  router.get("/", logoutController.userLogout);

  return router;
};

module.exports = logoutRouter;
