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
//    2.0. Helper functions
//    2.1. createFiles
//    2.2. getFilesByUserId
//    2.3. deleteFileById
//    2.4. renameFileById
//    2.5. getFileByUserAndFolder
// 3. Export
// =========================

// =========================
// 1. SETUP
// =========================
const prisma = require("../config/prisma");
const { Prisma } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const ValidationError = require("../errors/ValidationError");
const handlePrismaError = require("../utils/prismaErrorHandler");
const NotFoundError = require("../errors/NotFoundError");
const cloudinary = require("../config/cloudinary");

// =========================
// 2. FILE FUNCTIONS
// =========================
// =========================
// 2.0. HELPER FUNCTIONS
// =========================
// Reusable utility functions.
//
// Functions:
// - validUserIdCheck(userId, message):
//    - Ensures the provided user ID is valid (non-empty string).
//      - This is a minimal check as the auth middleware should validate users beforehand.
//    - Throws a `ValidationError` if the ID is missing or invalid.
//    - Accepts an optional `message` parameter to customize error messages.
// =========================
function validUserIdCheck(userId, message) {
  if (!userId || typeof userId !== "string") {
    throw new ValidationError(`Valid user ID (UUID) is required to ${message}`);
  }
}

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
// - ValidationError: If userId is missing or invalid (e.g. not a string).
// =========================
async function createFiles(uploads, userId, folderId = null) {
  try {
    validUserIdCheck(userId, "upload files");

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
// - ValidationError: If userId is missing or invalid (e.g. not a string).
// =========================
async function getFilesByUserId(userId, folderId = null) {
  try {
    // Validate userId (minimal check, assumes auth middleware ensures existence)
    validUserIdCheck(userId, "view files");

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
// 2.3. DELETEFILEBYID
// =========================
// Deletes a file from Cloudinary and the File table. If Cloudinary deletion fails, then it skips deleting from the
// file table.
//
// Parameters:
// - fileId (string): The ID of the file to be deleted.
// - userId (string): The ID of the user who owns the file.
//
// Returns:
// - An object with a successful deletion message.
//
// Throws:
// - ValidationError: If userId is missing or invalid (e.g. not a string).
// - NotFoundError: If the file isn't found.
// - Error: Generic error if the file fails to delete from Cloudinary.
// =========================
async function deleteFileById(fileId, userId) {
  try {
    validUserIdCheck(userId, "delete files.");

    const file = await prisma.file.findUnique({
      where: {
        id: fileId,
        userId,
      },
    });

    if (!file) {
      throw new NotFoundError("File not found.");
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(file.cloudId);

    // Delete from database
    await prisma.file.delete({ where: { id: fileId } });

    return { message: "File deleted successfully." };
  } catch (err) {
    // Handle prisma errors directrly
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      handlePrismaError(err);
    }

    // Propagate non-prisma errors
    console.error("File deletion failed: ", err);
    throw err;
  }
}

// =========================
// 2.4. RENAMEFILEBYID
// =========================
// Renames a file in the database.
//
// Parameters:
// - userId (string): The ID of the user who owns the file.
// - fileId (string): The ID of the file to be renamed.
// - newFilename (string): The new name for the file.
//
// Returns:
// - An object containing the updated file details.
//
// Throws:
// - ValidationError: If the userId is invalid or newFilename contains invalid characters.
// - NotFoundError: If the file doesn't exist for the given user.
// - DatabaseError: If a Prisma-related error occurs during the update.
// =========================
async function renameFileById(userId, fileId, newFilename) {
  try {
    validUserIdCheck(userId, "rename files");

    // Validate filename (allow letters, numbers, spaces, dashes, underscores, and dots)
    const filenameRegex = /^[a-zA-Z0-9-_ .]+$/;

    if (
      !newFilename ||
      typeof newFilename !== "string" ||
      newFilename.trim() === ""
    ) {
      throw new ValidationError("A valid new filename is required.");
    }

    if (!filenameRegex.test(newFilename)) {
      throw new ValidationError(
        "Filename contains invalid characters. Only letters, numbers, spaces, dashes, underscores, and dots are allowed."
      );
    }

    const file = await prisma.file.update({
      where: {
        id: fileId,
        userId,
      },
      data: {
        filename: newFilename.trim(),
      },
    });

    return file;
  } catch (err) {
    if (typeof err !== "ValidationError") {
      handlePrismaError(err);
    }

    throw err;
  }
}

// =========================
// 2.5. GETFILEBYUSERANDFOLDER
// =========================
// Retrieves a file by quering for the filename, the user ID who owns the file, and folder ID the file is stored in.
//
// Parameters:
// - userId (string): The ID of the user who owns the file.
// - filename (string): The name of the file to be retrieved.
// - folderId (string): The ID of the folder the file is stored in.
//
// Returns:
// - An object containing the file details.
//
// Throws:
// - ValidationError: If the userId or filename is invalid.
// =========================
async function getFileByUserAndFolder(userId, filename, folderId) {
  try {
    validUserIdCheck(userId, "retrieve files");

    if (!filename || typeof filename !== "string" || filename.trim() === "") {
      throw new ValidationError("Filename must be a non-empty string.");
    }

    const file = await prisma.file.findFirst({
      where: {
        userId,
        filename,
        folderId,
      },
    });

    return file;
  } catch (err) {
    if (typeof err !== "ValidationError") {
      handlePrismaError(err);
    }

    throw err;
  }
}

// =========================
// 3. EXPORT
// =========================
module.exports = {
  createFiles,
  getFilesByUserId,
  deleteFileById,
  renameFileById,
  getFileByUserAndFolder,
};
