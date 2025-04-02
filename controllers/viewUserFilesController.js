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
//    2.3. postRenameFile
//    2.4. postDeleteFile
//    2.5. postRenameFolder
//    2.6. postDeleteFolder
// 3. Export
// =========================

// =========================
// 1. SETUP
// =========================
const asyncHandler = require("express-async-handler");
const {
  getFilesByUserId,
  getFileByUserAndFolder,
  renameFileById,
  deleteFileById,
} = require("../services/fileService");
const {
  createFolder,
  getFoldersByUserId,
  getFolderByPath,
  renameFolderById,
  getFolderByUserAndParent,
  deleteFolderById,
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
// 2.3. POSTRENAMEFILE
// =========================
// Handles requests to rename an existing file.
//
// This function:
// - Extracts information from the client request.
// - Uses the information to find the correct file.
// - Renames the file.
// - Handles errors gracefully.
//
// Parameters:
// - req.user.id (string): The user ID stored in session cookie.
// - req.body.currentPath (string): The filepath passed from the client-side request.
// - req.body.oldItemName (string): The current name of the file.
// - req.body.newItemName (string): The new filename submitted by the user.
//
// Returns:
// - An object containing a successful rename message.
//
// Throws:
// - NotFoundError: If the file isn't found.
// - ValidationError: If the new filename is invalid.
// - Other: Prisma query functions from `fileService.js` and `folderService.js` have their own error handling.
// =========================
const postRenameFile = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const { currentPath, oldItemName, newItemName } = req.body;

  // Verify path to find parent folder ID
  const parentFolder = currentPath
    ? await getFolderByPath(userId, currentPath)
    : null;
  const folderId = parentFolder ? parentFolder.id : null;

  // Find the file
  const file = await getFileByUserAndFolder(userId, oldItemName, folderId);
  if (!file) {
    throw new NotFoundError("File not found.");
  }

  // Validate the new filename
  if (
    !newItemName ||
    typeof newItemName !== "string" ||
    newItemName.trim() === ""
  ) {
    throw new ValidationError("A valid new filename is required.");
  }
  const filenameRegex = /^[a-zA-Z0-9-_ .]+$/;
  if (!filenameRegex.test(newItemName)) {
    throw new ValidationError(
      "Filename contains invalid characters. Only letters, numbers, spaces, dashes, underscores, and dots are allowed."
    );
  }

  // Rename the file
  const updatedFile = await renameFileById(userId, file.id, newItemName.trim());

  res.json({ message: "File renamed successfully" });
});

// =========================
// 2.4. POSTDELETEFILE
// =========================
// Handles requests to delete an existing file.
//
// This function:
// - Extracts information from the client request.
// - Uses the information to find the correct file.
// - Deletes the file.
// - Handles errors gracefully.
//
// Parameters:
// - req.user.id (string): The user ID stored in session cookie.
// - req.body.currentPath (string): The filepath passed from the client-side request.
// - req.body.itemName (string): The name of the file to be deleted.
//
// Returns:
// - An object containing a successful deletion message.
//
// Throws:
// - NotFoundError: If the file isn't found.
// - Other: Prisma query functions from `fileService.js` and `folderService.js` have their own error handling.
// =========================
const postDeleteFile = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const { currentPath, itemName } = req.body;

  // verify path to find parent folder ID
  const parentFolder = currentPath
    ? await getFolderByPath(userId, currentPath)
    : null;
  const folderId = parentFolder ? parentFolder.id : null;

  // Find the file
  const file = await getFileByUserAndFolder(userId, itemName, folderId);
  if (!file) {
    throw new NotFoundError("File not found.");
  }

  // Delete the file
  await deleteFileById(file.id, userId);

  res.json({ message: "File deleted successfully" });
});

// =========================
// 2.5. POSTRENAMEFOLDER
// =========================
// Handles requests to rename an existing folder.
//
// This function:
// - Extracts information from the client request.
// - Uses the information to find the correct folder.
// - Renames the folder.
// - Handles errors gracefully.
//
// Parameters:
// - req.user.id (string): The user ID stored in session cookie.
// - req.body.currentPath (string): The filepath passed from the client-side request.
// - req.body.oldItemName (string): The current name of the folder.
// - req.body.newItemName (string): The new folder name submitted by the user.
//
// Returns:
// - An object containing a successful rename message.
//
// Throws:
// - NotFoundError: If the folder isn't found.
// - ValidationError: If the new folder name is invalid.
// - Other: Prisma query functions from `fileService.js` and `folderService.js` have their own error handling.
// =========================
const postRenameFolder = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const { currentPath, oldItemName, newItemName } = req.body;

  // Verify path to find parent folder ID
  const parentFolder = currentPath
    ? await getFolderByPath(userId, currentPath)
    : null;
  const parentFolderId = parentFolder ? parentFolder.id : null;

  // Find the file
  const folder = await getFolderByUserAndParent(
    userId,
    oldItemName,
    parentFolderId
  );
  if (!folder) {
    throw new NotFoundError("Folder not found.");
  }

  // Validate the new folder name
  if (
    !newItemName ||
    typeof newItemName !== "string" ||
    newItemName.trim() === ""
  ) {
    throw new ValidationError("A valid new folder name is required.");
  }
  const folderNameRegex = /^[a-zA-Z0-9-_ ]+$/;
  if (!folderNameRegex.test(newItemName)) {
    throw new ValidationError(
      "Folder name contains invalid characters. Only letters, numbers, spaces, dashes, and underscores are allowed."
    );
  }

  // Rename the folder
  const updatedFolder = await renameFolderById(
    folder.id,
    userId,
    newItemName.trim()
  );

  res.json({ message: "Folder renamed successfully" });
});

// =========================
// 2.6. POSTDELETEFOLDER
// =========================
// Handles requests to delete an existing folder.
//
// This function:
// - Extracts information from the client request.
// - Uses the information to find the correct folder.
// - Deletes the folder.
// - Handles errors gracefully.
//
// Parameters:
// - req.user.id (string): The user ID stored in session cookie.
// - req.body.currentPath (string): The filepath passed from the client-side request.
// - req.body.itemName (string): The name of the folder to be deleted.
//
// Returns:
// - An object containing a successful deletion message.
//
// Throws:
// - NotFoundError: If the folder isn't found.
// - Other: Prisma query functions from `fileService.js` and `folderService.js` have their own error handling.
// =========================
const postDeleteFolder = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const { currentPath, itemName } = req.body;
  console.log("userId: ", userId);
  console.log("req body: ", req.body);

  // verify path to find parent folder ID
  const parentFolder = currentPath
    ? await getFolderByPath(userId, currentPath)
    : null;
  const parentFolderId = parentFolder ? parentFolder.id : null;
  console.log(parentFolderId);

  // Find the file
  const folder = await getFolderByUserAndParent(
    userId,
    itemName,
    parentFolderId
  );
  if (!folder) {
    throw new NotFoundError("File not found.");
  }

  console.log(folder);

  // Delete the file
  await deleteFolderById(folder.id, userId);

  res.json({ message: "Folder deleted successfully" });
});

// =========================
// 3. EXPORT
// =========================
module.exports = {
  getUserFilesPage,
  postCreateFolder,
  postRenameFile,
  postDeleteFile,
  postRenameFolder,
  postDeleteFolder,
};
