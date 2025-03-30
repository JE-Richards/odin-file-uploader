// =========================
// FOLDER SERVICE
// =========================
// Handles folder-related database operations using Prisma.
// This service abstracts database interactions for creating and managing folders.
//
// Sections:
// 1. Setup
// 2. Folder Functions
//    2.1. createFolder
//    2.2. getFoldersByUserId
//    2.3. getFolderByPath
// 3. Export
// =========================

// =========================
// 1. SETUP
// =========================
const prisma = require("../config/prisma");
const ValidationError = require("../errors/ValidationError");
const handlePrismaError = require("../utils/prismaErrorHandler");
const NotFoundError = require("../errors/NotFoundError");

// =========================
// 2. FOLDER FUNCTIONS
// =========================
// =========================
// 2.1. CREATEFOLDER
// =========================
// Handles adding new entries into the Files table by storing multiple cloudinary upload results in the database and
// associating them with a user.
// Handles adding new entries into the Folder table by storing the new folder and associating it with a user and
// an optional parent folder.
//
// Parameters:
// - userId (string): The ID of the user who performed the upload, from the session store.
// - folderName (string): The name of the new folder submitted by the user.
// - parentFolderId (string | null): Optional. If provided, the new folder will be created as a subfolder within the
// specified parent folder. If null (default), the folder is created at the root level.
//
// Returns:
// - Promise<object>: A Promise resolving to an object representing the created folder.
//
// Throws:
// - ValidationError: If any input parameters are missing or not of the desired type.
// =========================
async function createFolder(userId, folderName, parentFolderId = null) {
  try {
    if (!userId || typeof userId !== "string") {
      throw new ValidationError(
        "Valid user ID (UUID) is required for creating folders."
      );
    }

    if (!folderName || typeof folderName !== "string") {
      throw new ValidationError("Folder name must be a non-empty string.");
    }

    if (parentFolderId !== null && typeof parentFolderId !== "string") {
      throw new ValidationError(
        "Parent folder ID must be a valid UUID or null."
      );
    }

    const folder = await prisma.folder.create({
      data: {
        name: folderName,
        userId: userId,
        parentFolderId: parentFolderId,
      },
    });

    return folder;
  } catch (err) {
    handlePrismaError(err);
  }
}

// =========================
// 2.2. GETFOLDERSBYUSERID
// =========================
// Retrieves all folders within a specified 'parent folder' associated with a given user ID.
// Additionally, retrieves the users username from the user model.
//
// Parameters:
// - userId (string): The ID of the user whose files need retrieving.
// - parentFolderId (string | null): Optional. If provided, only folders within the specified parent folder are
// retrieved. If null (default), retrieves all folders at the root level.
//
// Returns:
// - An array of objects if folders exist.
// - An empty array if no folders exist for the user.
//
// Throws:
// - ValidationError: If userId is missing or invalid (e.g. not a number).
// =========================
async function getFoldersByUserId(userId, parentFolderId = null) {
  try {
    if (!userId || typeof userId !== "string") {
      throw new ValidationError(
        "Valid user ID (UUID) is required for creating folders."
      );
    }

    if (parentFolderId !== null && typeof parentFolderId !== "string") {
      throw new ValidationError(
        "Parent folder ID must be a valid UUID or null."
      );
    }

    const folders = await prisma.folder.findMany({
      where: {
        userId,
        parentFolderId,
      },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    return folders;
  } catch (err) {
    handlePrismaError(err);
  }
}

// =========================
// 2.3. GETFOLDERBYPATH
// =========================
// Resolves a folder path string into the corresponding folder object in the database.
// The function iterates through the folder hierarchy, starting from the root, to determine the correct folder based on
// the provided path.
//
// Parameters:
// - userId (string): The ID of the user who owns the folder.
// - folderPath (string): The folder path (e.g. "folder-1/folder-2") representing the nested structure.
//
// Returns:
// - An object representing the folder if found.
// - Null if the path is invalid or the folder does not exist.
// =========================
async function getFolderByPath(userId, folderPath) {
  // convert path to an array of folder names
  const folderNames = folderPath.split("/");
  let parentFolderId = null;
  let currentFolder = null;

  for (const folderName of folderNames) {
    currentFolder = await prisma.folder.findFirst({
      where: {
        userId: userId,
        name: folderName,
        parentFolderId: parentFolderId,
      },
    });

    // invalid path
    if (!currentFolder) {
      return null;
    }

    parentFolderId = currentFolder.id;
  }

  return currentFolder;
}

// =========================
// 3. EXPORT
// =========================
module.exports = { createFolder, getFoldersByUserId, getFolderByPath };
