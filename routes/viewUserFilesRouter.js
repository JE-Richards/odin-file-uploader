const { Router } = require("express");
const {
  getUserFilesPage,
  postCreateFolder,
} = require("../controllers/viewUserFilesController");
const { ensureUserAuth } = require("../middleware/authMiddleware");

const viewUserFilesRouter = () => {
  const router = new Router();

  router.get("/", ensureUserAuth, getUserFilesPage); // Root level route
  router.get("/:folderPath*", ensureUserAuth, getUserFilesPage); // dynamic route to accommodate nested folders

  router.post("/create-folder", ensureUserAuth, postCreateFolder); // Handle folder creation at the root level
  router.post("/:folderPath*/create-folder", ensureUserAuth, postCreateFolder); // Handle folder creation for nested folders
  return router;
};

module.exports = viewUserFilesRouter;
