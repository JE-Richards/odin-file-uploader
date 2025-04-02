// =========================
// FILE ACTIONS (CLIENT-SIDE)
// =========================
// This script manages rename and delete actions for files and folders on the `viewUserFiles` page.
// It listens for button clicks and sends PATCH (rename) or DELETE (delete) requests to the server.
//
// Features:
// - Selects all "rename" and "delete" buttons on the page.
// - Defines separate functions to handle rename and delete actions.
// - Sends necessary data (current path & item names) to the server.
// - Uses confirmation prompts for delete actions to prevent accidental deletion.
// - Reloads the page after actions to reflect changes.
//
// Sections:
// 1. Initialisation
// 2. Helper functions
//    2.1. getCurrentPath
//    2.2. handleDelete
//    2.3. handleRename
// 3. Event listeners
// =========================

// =========================
// 1. INITIALISATION
// =========================
// Selects all the buttons related to rename and delete actions.
// =========================
document.addEventListener("DOMContentLoaded", function () {
  const deleteFolderButtons = document.querySelectorAll(".delete-folder-btn");
  const renameFolderButtons = document.querySelectorAll(".rename-folder-btn");
  const deleteFileButtons = document.querySelectorAll(".delete-file-btn");
  const renameFileButtons = document.querySelectorAll(".rename-file-btn");

  // =========================
  // 2. HELPER FUNCTIONS
  // =========================
  // Utility functions to get the current folder path, delete an item, and rename an item.
  // =========================

  // =========================
  // 2.1. GETCURRENTPATH
  // =========================
  // Retrieves the current folder path by extracting it from the URL.
  //
  // Returns:
  // - A string with the relative path within the file system.
  // =========================
  function getCurrentPath() {
    return window.location.pathname.replace("/files", ""); // returns everything after /files
  }

  // =========================
  // 2.2. HANDLEDELETE
  // =========================
  // Submits a delete request for the file or folder.
  //
  // Parameters:
  // - url (string): The server endpoint for deletion.
  // - itemName (string): The name of the file or folder to delete.
  // - isFolder (boolean): Whether the item is a folder (true) or a file (false - default).
  // =========================
  async function handleDelete(url, itemName, isFolder = false) {
    const confirmMessage = isFolder
      ? "Are you sure you want to delete this folder? All files and folders it contains will also be deleted."
      : "Are you sure you want to delete this file?";

    if (!confirm(confirmMessage)) return;

    const currentPath = getCurrentPath();

    console.log(`sending request with: ${currentPath}, ${itemName}`);

    // send the path and item name back to the server
    await fetch(url, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPath, itemName }),
    });

    //window.location.reload(); // Reload to reflect changes after await finishes
  }

  // =========================
  // 2.3. HANDLERENAME
  // =========================
  // Submits a rename request for the file or folder.
  // This also prompts the user to submit a new name for the file or folder.
  //
  // Parameters:
  // - url (string): The server endpoint for renaming.
  // - itemName (string): The current name of the file or folder to delete.
  // - isFolder (boolean): Whether the item is a folder (true) or a file (false - default).
  // =========================
  async function handleRename(url, oldItemName, isFolder = false) {
    const newItemName = prompt(
      `Enter a new name for the ${isFolder ? "folder" : "file"}:`
    );

    if (!newItemName) return;

    const currentPath = getCurrentPath();
    console.log("client current path: ", currentPath);

    await fetch(url, {
      method: "PATCH", // PATCH is for partial transformations (e.g. rename)
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPath, oldItemName, newItemName }),
    });

    window.location.reload();
  }

  // =========================
  // 4. EVENT LISTENERS
  // =========================
  // Attaches event listeners to the rename and delete buttons.
  // =========================
  deleteFolderButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const name = button.getAttribute("data-folder-name");
      handleDelete("/files/delete-folder", name, true);
    });
  });

  renameFolderButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const oldName = button.getAttribute("data-folder-name");
      handleRename("/files/rename-folder", oldName, true);
    });
  });

  deleteFileButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const name = button.getAttribute("data-file-name");
      handleDelete("/files/delete-file", name, false);
    });
  });

  renameFileButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const oldName = button.getAttribute("data-file-name");
      handleRename("/files/rename-file", oldName, false);
    });
  });
});
