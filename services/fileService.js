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
//    2.2. getFilesByUserId
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
// - userId (string): The ID of the user who performed the upload, from the session store.
// - folderId (string | null): Optional. If provided, uploads the file into the folder. If null (default), uploads the
// file to the root level.
//
// Returns:
// - An object with the count of created records.
//
// Throws:
// - ValidationError: If userId is missing or invalid (e.g. not a number).
// =========================
async function createFiles(uploads, userId, folderId = null) {
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
        folderId: folderId,
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
// 2.2. GETFILESBYUSERID
// =========================
// Retrieves all files within a specified folder associated with a given user ID.
// Additionally, retrieves the users username from the user model.
//
// Parameters:
// - userId (string): The ID of the user whose files need retrieving.
// - folderId (string | null): Optional. If provided, only files within the specified folder are retrieved. If null
// (default), retrieves all files at the root level.
//
// Returns:
// - An array of objects if files exist.
// - An empty array if no files exist for the user.
//
// Throws:
// - ValidationError: If userId is missing or invalid (e.g. not a number).
// =========================
async function getFilesByUserId(userId, folderId = null) {
  try {
    // Validate userId (minimal check, assumes auth middleware ensures existence)
    if (!userId || typeof userId !== "string") {
      throw new ValidationError(
        "Valid user ID (UUID) is required to view files."
      );
    }

    const files = await prisma.file.findMany({
      where: {
        userId,
        folderId,
      },
      // join on username from users model
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    return files;
  } catch (err) {
    handlePrismaError(err);
  }
}

// =========================
// 3. EXPORT
// =========================
module.exports = { createFiles, getFilesByUserId };
