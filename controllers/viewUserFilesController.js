// =========================
// VIEW USER FILES CONTROLLER
// =========================
// This controller handles
//
// Sections:
// 1. Setup
// 2. Controller Functions
//    2.1. getUserFilesPage
//    2.2. postCreateFolder
// 3. Export
// =========================

// =========================
// 1. SETUP
// =========================
const asyncHandler = require("express-async-handler");
const { getFilesByUserId } = require("../services/fileService");
const {
  createFolder,
  getFoldersByUserId,
  getFolderByPath,
} = require("../services/folderService");
const NotFoundError = require("../errors/NotFoundError");

// =========================
// 2. CONTROLLER FUNCTIONS
// =========================
// =========================
// 2.1. GETUSERFILESPAGE
// =========================
// Renders the view user files page, which:
// - Displays all of the users files if they exist.
// - Displays a message along with a link to the upload page if no files exist.
// =========================
const getUserFilesPage = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const folderPath = req.params.folderPath || null; // extract folder path from URL or default to `null` for root

  // return the correct folder based on path
  let parentFolder = null;
  if (folderPath) {
    parentFolder = await getFolderByPath(userId, folderPath);
    if (!parentFolder) {
      throw new NotFoundError(`Folder not found.`);
    }
  }

  const files = await getFilesByUserId(
    userId,
    parentFolder ? parentFolder.id : null
  );
  const folders = await getFoldersByUserId(
    userId,
    parentFolder ? parentFolder.id : null
  );

  res.render("viewUserFiles", {
    files,
    folders,
    currentPath: folderPath || "",
  });
});

// =========================
// 2.2. POSTCREATEFOLDER
// =========================
// Handles the creation of a new folder and redirects to the appropriate page.
//
// This function:
// - Retrieves the user's ID and folder name from the request.
// - If a folder path is provided, it resolves the parent folder by its path.
// - Creates a new folder in the database, either at the root level or inside the specified parent folder.
// - Redirects to the updated view, showing the newly created folder.
//
// Parameters:
// - req.body["folder-name"] (string): The name of the new folder to be created.
// - req.params.folderPath (string | null): The optional path of the parent folder where the new folder will be created.
// If null, creates at the root level.
//
// Returns:
// - A redirect response to the updated view user files page, showing the created folder.
//
// Throws:
// - NotFoundError: If the parent folder (if specified) is invalid or does not exist.
// =========================
const postCreateFolder = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const { "folder-name": folderName } = req.body;
  console.log("folderName: ", folderName);

  // Clean up folder path as the POST route always ends with "/create-folder"
  let folderPath = req.params.folderPath || null;
  if (folderPath && folderPath.endsWith("/create-folder")) {
    folderPath = folderPath.slice(0, -12); // Remove "/create-folder"
  }
  console.log("folderPath: ", folderPath);

  let parentFolder = null;
  if (folderPath) {
    parentFolder = await getFolderByPath(userId, folderPath);
    console.log("parebtFolder: ", parentFolder);
    if (!parentFolder) {
      throw new NotFoundError("Invalid parent folder.");
    }
  }

  await createFolder(userId, folderName, parentFolder ? parentFolder.id : null);

  return res.redirect(`/files${folderPath ? "/" + folderPath : ""}`); // Reload the page
});

// =========================
// 3. EXPORT
// =========================
module.exports = { getUserFilesPage, postCreateFolder };
