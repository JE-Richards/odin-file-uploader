// =========================
// UPLOAD CONTROLLER
// =========================
// This controller handles file uploads and related errors by taking files
// passed to `req` by Multer and uploading them to Cloudinary via its API.
//
// Sections:
// 1. Setup
// 2. Controller Functions
//    2.1. getUploadPage
//    2.2. postUpload
// 3. Export
// =========================

// =========================
// 1. SETUP
// =========================
const cloudinary = require("../config/cloudinary");
const asyncHandler = require("express-async-handler");
const { createFiles } = require("../services/fileService");

// =========================
// 2. CONTROLLER FUNCTIONS
// =========================
// =========================
// 2.1. GETUPLOADPAGE
// =========================
// Renders the upload page, displaying an empty form with no errors.
// =========================
const getUploadPage = (req, res) => {
  res.render("upload", { errors: [], message: "" });
};

// =========================
// 2.2. POSTUPLOAD
// =========================
// Handles file upload form submissions:
// - Re-renders the upload page if no files are present (e.g., due to Multer
// errors).
// - Uploads all valid files to Cloudinary via its API.
// - Errors (Multer or Cloudinary) are passed to the global error handler via
// asyncHandler.
// =========================
const postUpload = asyncHandler(async (req, res, next) => {
  let errors = [];

  // check multer errors or no files
  if (!req.files || req.files.length === 0) {
    errors.push({ msg: "No files uploaded or invalid upload attempt." });
    return res.render("upload", { errors, message: "" });
  }

  // Upload to cloudinary - handle multiple files
  const uploadPromises = req.files.map(
    (file) =>
      new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              resource_type: "auto",
              filename_override: file.originalname,
              use_filename: true,
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          )
          .end(file.buffer);
      })
  );

  const results = await Promise.all(uploadPromises);
  console.log(results);

  const { count } = await createFiles(results, req.user.id);

  res.render("upload", {
    errors: [],
    message: `Successfully uploaded ${count} files.`,
  });
});

// =========================
// 3. EXPORT
// =========================
module.exports = { getUploadPage, postUpload };
