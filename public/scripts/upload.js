// =========================
// FILE UPLOAD VALIDATION (CLIENT-SIDE)
// =========================
// This script contains the client-side form validation JS functions for file
// uploads. It includes the validation function definitions and event listener
// application.
//
// Features:
// - Validates that the files selected are accepted formats.
// - Display an error message if any files are invalid.
// - Disables the submit button if errors are present or input is empty.
//
// Sections:
// 1. Initialisation
// 2. Helper functions
// 3. Validation functions
// 4. Event listeners
// =========================

// =========================
// 1. INITIALISATION
// =========================
// Selects the input field to apply validation, the form, the submit button, and
// the error message div.
// Adds the document event listener to wait for DOM content to load before
// execution.
// =========================
document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form");
  const submitButton = document.querySelector("button[type='submit']");
  const uploadInput = document.getElementById("file");
  const errorDiv = document.getElementById("file-error");

  const acceptedExtensions = [
    ".mp3",
    ".mp4",
    ".jpeg",
    ".png",
    ".gif",
    ".svg",
    ".pdf",
    ".txt",
  ];
  const maxFiles = 10;
  const maxSize = 5 * 1024 * 1024; // 5MB

  // =========================
  // 2. HELPER FUNCTIONS
  // =========================
  // - toggleSubmitButton(): Enables/disables the submit button based on errors.
  // =========================
  function toggleSubmitButton() {
    const hasError = errorDiv.textContent.trim() !== "";
    const inputNotEmpty = uploadInput.files.length > 0;
    const inputLessThanMax = uploadInput.files.length <= 10;

    submitButton.disabled = hasError || !inputNotEmpty || !inputLessThanMax;
  }

  // =========================
  // 3. VALIDATION FUNCTIONS
  // =========================
  // Defines rules for file upload validation, aligned with the
  // server-side validation rules.
  // - validateFiles(): Ensures that:
  //    - 10 files or less are selected
  //    - Each file is less than 5MB
  //    - Each filse has an accepted file extension
  // =========================
  function validateFiles() {
    let errorMessage = "";
    const sizeErrors = [];
    const extensionErrors = [];
    const errorParts = [];
    const files = uploadInput.files;

    // check file count
    if (files.length > maxFiles) {
      errorMessage = `Too many files selected (${files.length}). Maximum is ${maxFiles}.`;
      errorDiv.textContent = errorMessage;
      toggleSubmitButton();
      return; // exit early
    }

    // If file count okay, check size and extensions
    for (const file of files) {
      if (file.size > maxSize) {
        sizeErrors.push(
          `${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB)`
        );
      }

      const fileExtension = "." + file.name.split(".").pop().toLowerCase();
      if (!acceptedExtensions.includes(fileExtension)) {
        extensionErrors.push(file.name);
      }
    }

    // Build combined error message for size and extensions
    if (sizeErrors.length > 0) {
      errorParts.push(`Files exceeding 5MB limit: ${sizeErrors.join(", ")}.`);
    }
    if (extensionErrors.length > 0) {
      errorParts.push(`Invalid file types: ${extensionErrors.join(", ")}.`);
    }
    if (errorParts.length > 0) {
      errorMessage = errorParts.join(" ");
    }

    errorDiv.textContent = errorMessage;
    toggleSubmitButton();
  }

  // =========================
  // 4. EVENT LISTENERS
  // =========================
  // Attaches event listeners to the form and input fields:
  // - `change`: Triggers when the file input changes.
  // - `submit`: Performs final validation check before submission.
  // =========================
  uploadInput.addEventListener("change", validateFiles);

  // failsafe check
  form.addEventListener("submit", function (event) {
    validateFiles();

    const errorPresent = errorDiv.textContent.trim() !== "";
    if (errorPresent) {
      event.preventDefault();
    }
  });

  toggleSubmitButton();
});
