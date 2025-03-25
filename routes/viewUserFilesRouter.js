const { Router } = require("express");
const { getUserFilesPage } = require("../controllers/viewUserFilesController");
const { ensureUserAuth } = require("../middleware/authMiddleware");

const viewUserFilesRouter = () => {
  const router = new Router();

  router.get("/", ensureUserAuth, getUserFilesPage);

  return router;
};

module.exports = viewUserFilesRouter;
