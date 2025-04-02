const { Router } = require("express");
const {
  getUserFilesPage,
  postCreateFolder,
  postRenameFile,
  postDeleteFile,
  postRenameFolder,
  postDeleteFolder,
} = require("../controllers/viewUserFilesController");
const { ensureUserAuth } = require("../middleware/authMiddleware");

const viewUserFilesRouter = () => {
  const router = new Router();

  router.use((req, res, next) => {
    console.log(
      `[${req.method}] ${req.path}, Body:`,
      req.body,
      ` user: ${req.user.id}`
    );
    next();
  });

  router.get("/", ensureUserAuth, getUserFilesPage); // Root level route
  router.get("/:folderPath*", ensureUserAuth, getUserFilesPage); // dynamic route to accommodate nested folders

  router.post("/create-folder", ensureUserAuth, postCreateFolder); // Handle folder creation at the root level
  router.post("/:folderPath*/create-folder", ensureUserAuth, postCreateFolder); // Handle folder creation for nested folders

  router.patch("/rename-file", ensureUserAuth, postRenameFile);
  router.patch("/rename-folder", ensureUserAuth, postRenameFolder);

  router.delete("/delete-file", ensureUserAuth, postDeleteFile);
  router.delete("/delete-folder", ensureUserAuth, postDeleteFolder);
  return router;
};

module.exports = viewUserFilesRouter;
