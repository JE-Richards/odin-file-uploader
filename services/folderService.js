// =========================
// FOLDER SERVICE
// =========================
// Handles folder-related database operations using Prisma.
// This service abstracts database interactions for creating and managing folders.
//
// Sections:
// 1. Setup
// 2. Folder Functions
//    2.0. Helper functions
//    2.1. createFolder
//    2.2. getFoldersByUserId
//    2.3. getFolderByPath
//    2.4. deleteFolderById
//    2.5. renameFolderById
//    2.6. getFolderByUserAndParent
// 3. Export
// =========================

// =========================
// 1. SETUP
// =========================
const prisma = require("../config/prisma");
const cloudinary = require("../config/cloudinary");
const ValidationError = require("../errors/ValidationError");
const handlePrismaError = require("../utils/prismaErrorHandler");
const NotFoundError = require("../errors/NotFoundError");

// =========================
// 2. FOLDER FUNCTIONS
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
    validUserIdCheck(userId, "create a folder.");

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
    validUserIdCheck(userId, "view folders.");

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
// 2.4. DELETEFOLDERBYID
// =========================
// This function iterates through the folder hierarchy to find all files and subfolders contained within the specified
// folder. Then, it deletes all files from Cloudinary and deletes the folder in the database (which cascades to all
// files and subfolders).
//
// Parameters:
// - folderId (string): The ID of the folder to be deleted.
// - userId (string): The ID of the user who owns the folder.
//
// Returns:
// - An object with a successful deletion message.
// =========================
async function deleteFolderById(folderId, userId) {
  try {
    validUserIdCheck(userId, "delete a folder.");

    // Step 1 - fetch all folders and contents (subfolders and files)
    const folder = await prisma.folder.findUnique({
      where: {
        id: folderId,
        userId,
      },
      include: {
        files: true, // fetch files inside the folder
        children: {
          include: { files: true }, // Fetch all files in subfolders
        },
      },
    });

    if (!folder) {
      throw new NotFoundError("Folder not found.");
    }

    // Step 2 - collect the cloudId for each file to delete from Cloudinary
    const allFiles = [
      ...folder.files,
      ...folder.children.flatMap((subfolder) => subfolder.files),
    ];
    const cloudinaryFileIds = allFiles.map((file) => file.cloudId);

    // Step 3 - delete from Cloudinary first
    if (cloudinaryFileIds.length > 0) {
      await cloudinary.api.delete_resources(cloudinaryFileIds);
    }

    // Step 4 - delete the folder and cascade delete contents
    await prisma.folder.delete({
      where: {
        id: folderId,
      },
    });

    return { message: "Folder and its contents deleted successfully." };
  } catch (err) {
    handlePrismaError(err);
  }
}

// =========================
// 2.5. RENAMEFOLDERBYID
// =========================
// Renames a folder in the database.
//
// Parameters:
// - folderId (string): The ID of the folder to rename.
// - userId (string): The ID of the user who owns the folder.
// - newFolderName (string): The new name for the folder.
//
// Returns:
// - An object containing the updated folder details.
//
// Throws:
// - ValidationError: If the userId is invalid or the newFolderName contains invalid characters.
// =========================
async function renameFolderById(folderId, userId, newFolderName) {
  try {
    validUserIdCheck(userId, "rename folders.");

    // Validate folder name (allow letters, numbers, spaces, dashes, and underscores)
    const filenameRegex = /^[a-zA-Z0-9-_ ]+$/;

    if (
      !newFolderName ||
      typeof newFolderName !== "string" ||
      newFolderName.trim() === ""
    ) {
      throw new ValidationError("A valid folder name is required.");
    }

    if (!filenameRegex.test(newFolderName)) {
      throw new ValidationError(
        "Filename contains invalid characters. Only letters, numbers, spaces, dashes, underscores, and dots are allowed."
      );
    }

    const folder = await prisma.folder.update({
      where: {
        id: folderId,
        userId,
      },
      data: {
        name: newFolderName.trim(),
      },
    });

    return folder;
  } catch (err) {
    if (typeof err !== "ValidationError") {
      handlePrismaError(err);
    }

    throw err;
  }
}

// =========================
// 2.6. GETFOLDERBYUSERANDPARENT
// =========================
// Retrieves a folder by querying the folder name, the user ID who owns the folder, and parent folder ID the file is
// stored in.
//
// Parameters:
// - userId (string): The ID of the user who owns the folder.
// - folderName (string): The name of the folder to be retrieved.
// - parentFolderId (string): The ID of the folder the file is stored in, null if stored in root.
//
// Returns:
// - An object containing the folder details.
//
// Throws:
// - ValidationError: If the userId or folder name is invalid.
// =========================
async function getFolderByUserAndParent(userId, folderName, parentFolderId) {
  try {
    validUserIdCheck(userId, "retrieve folders");

    if (
      !folderName ||
      typeof folderName !== "string" ||
      folderName.trim() === ""
    ) {
      throw new ValidationError("Folder name must be a non-empty string.");
    }

    const folder = await prisma.folder.findFirst({
      where: {
        userId,
        name: folderName,
        parentFolderId,
      },
    });

    return folder;
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
  createFolder,
  getFoldersByUserId,
  getFolderByPath,
  deleteFolderById,
  renameFolderById,
  getFolderByUserAndParent,
};
