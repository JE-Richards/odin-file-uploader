// =========================
// FILE SERVICE
// =========================
// Handles file-related database operations using Prisma.
// This service abstracts database interactions for creating and managing files.
// For creating new files, the functions are set up under the assumption that the data supplied will be in the standard
// format returned by Cloudinary.
//
// Sections:
// 1. Setup
// 2. File Functions
//    2.1. createFiles
// 3. Export
// =========================

// =========================
// 1. SETUP
// =========================
const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");
const ValidationError = require("../errors/ValidationError");
const handlePrismaError = require("../utils/prismaErrorHandler");
const NotFoundError = require("../errors/NotFoundError");

// =========================
// 2. FILE FUNCTIONS
// =========================
// =========================
// 2.1. CREATEFILES
// =========================
// Handles adding new entries into the Files table by storing multiple cloudinary upload results in the database and
// associating them with a user.
//
// Parameters:
// - uploads (array): Array of Cloudinary response objects containing upload metadata.
// - userId (integet): The ID of the user who performed the upload, from the session store.
//
// Returns:
// - An object with the count of created records.
//
// Throws:
// - ValidationError: If userId is missing or invalid (e.g. not a number).
// =========================
async function createFiles(uploads, userId) {
  try {
    // Validate userId (minimal check, assumes auth middleware ensures existence)
    if (!userId || typeof userId !== "string") {
      throw new ValidationError("Valid user ID (UUID) is required for upload.");
    }

    // process uploads to desired format
    const uploadData = uploads.map((upload) => {
      // Cloudinary doesn't always incluyde 'format' as a separate field, it depends on filetype uploaded
      const format = upload.public_id.split(".").pop();
      return {
        cloudId: upload.public_id,
        filename: upload.original_filename,
        format: format,
        size: upload.bytes,
        url: upload.secure_url,
        uploadedAt: new Date(upload.created_at),
        userId: userId,
      };
    });

    // bulk create uploads for database
    const result = await prisma.file.createMany({
      data: uploadData,
      skipDuplicates: true,
    });

    return {
      count: result.count,
    };
  } catch (err) {
    handlePrismaError(err);
  }
}

// =========================
// 3. EXPORT
// =========================
module.exports = { createFiles };
