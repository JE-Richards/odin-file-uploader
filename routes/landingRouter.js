const { Router } = require("express");
const landingController = require("../controllers/landingController");

const landingRouter = () => {
  const router = Router();

  router.get("/", landingController.getLanding);

  return router;
};

module.exports = landingRouter;
