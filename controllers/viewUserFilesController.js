// =========================
// VIEW USER FILES CONTROLLER
// =========================
// This controller handles
//
// Sections:
// 1. Setup
// 2. Controller Functions
//    2.1. getUserFilesPage
// 3. Export
// =========================

// =========================
// 1. SETUP
// =========================
const asyncHandler = require("express-async-handler");
const { getFilesByUserId } = require("../services/fileService");

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
  const files = await getFilesByUserId(userId);

  res.render("viewUserFiles", {
    files,
  });
});

// =========================
// 3. EXPORT
// =========================
module.exports = { getUserFilesPage };
