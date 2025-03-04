// =========================
// SIGN UP VALIDATION (CLIENT-SIDE)
// =========================
// This script contains the client-side form validation JS functions for user
// sign ups. It includes the validation function definitions and event listener
// application.
//
// Features:
// -
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
// Selects the form and input fields to apply validation.
// Adds the document event listener to wait for DOM content to load before
// execution.
// =========================
document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form");
  const submitButton = document.querySelector("button[type='submit']");
  const usernameInput = document.getElementById("username");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirm-password");

  // =========================
  // 2. HELPER FUNCTIONS
  // =========================
  // - toggleSubmitButton(): Enables/disables the submit button based on errors.
  // - showError(): Displays the error message for an invalid input.
  // - clearError(): Removes the error message when inputs become valid.
  // =========================
  function toggleSubmitButton() {
    const errors = document.querySelectorAll(".error-message:not(:empty)");
    const allFieldsFilled =
      usernameInput.value.trim() && passwordInput.value.trim();

    submitButton.disabled = errors.length > 0 || !allFieldsFilled;
  }

  function showError(input, message) {
    const errorDiv = document.getElementById(`${input.id}-error`);
    errorDiv.textContent = message;
    input.classList.add("input-error");
    toggleSubmitButton();
  }

  function clearError(input) {
    const errorDiv = document.getElementById(`${input.id}-error`);
    errorDiv.textContent = "";
    input.classList.remove("input-error");
    toggleSubmitButton();
  }

  // =========================
  // 3. VALIDATION FUNCTIONS
  // =========================
  // Defines rules for username and password validation, aligned with the
  // server-side validation rules.
  // - validateUsername(): Ensures length and character restrictions are met.
  // - validateEmail(): Ensures length restriction and valid email format.
  // - validatePassword(): Ensures minimum length requirement.
  // - validateConfirmPassword(): Ensures confirm password and password match.
  // =========================
  function validateUsername() {
    const username = usernameInput.value.trim();
    const usernameRegex = /^[a-zA-Z0-9_-]+$/; // Allow letters, numbers, underscores, and dashes only

    if (username.length === 0) {
      return;
    }

    if (username.length < 3) {
      showError(usernameInput, "Username must be at least 3 characters.");
    } else if (username.length > 32) {
      showError(
        usernameInput,
        "Username must be less than 32 characters long."
      );
    } else if (!usernameRegex.test(username)) {
      showError(
        usernameInput,
        "Username can only contain letters, numbers, underscores (_), and dashes (-)."
      );
    } else {
      clearError(usernameInput);
    }
  }

  function validateEmail() {
    const email = emailInput.value.trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (email.length === 0) {
      return;
    }

    if (!emailRegex.test(email)) {
      showError(
        emailInput,
        "Please enter a valid email address (e.g. user@example.com)."
      );
    } else if (email.length > 255) {
      showError(emailInput, "Email must be less than 255 characters.");
    } else {
      clearError(emailInput);
    }
  }

  function validatePassword() {
    if (passwordInput.value.length === 0) {
      return;
    }

    if (passwordInput.value.length < 6) {
      showError(passwordInput, "Password must be at least 6 characters.");
    } else {
      clearError(passwordInput);
    }
  }

  function validateConfirmPassword() {
    if (confirmPasswordInput.value !== passwordInput.value) {
      showError(confirmPasswordInput, "Passwords do not match.");
    } else {
      clearError(confirmPasswordInput);
    }
  }

  // =========================
  // 4. EVENT LISTENERS
  // =========================
  // Attaches event listeners to the form and input fields:
  // - `blur`: Triggers when a user leaves the field
  // - `input`: Triggers validation while typing if an error already exists
  // - `submit`: Performs final validation check before submission.
  // =========================
  usernameInput.addEventListener("blur", validateUsername);
  usernameInput.addEventListener("input", function () {
    if (this.classList.contains("input-error")) {
      validateUsername();
    }
  });

  emailInput.addEventListener("blur", validateEmail);
  emailInput.addEventListener("input", function () {
    if (this.classList.contains("input-error")) {
      validateEmail();
    }
  });

  passwordInput.addEventListener("blur", validatePassword);
  passwordInput.addEventListener("input", function () {
    if (this.classList.contains("input-error")) {
      validatePassword();
    }
  });

  confirmPasswordInput.addEventListener("blur", validateConfirmPassword);
  confirmPasswordInput.addEventListener("input", function () {
    if (this.classList.contains("input-error")) {
      validatePassword();
    }
  });

  // Failsafe submit event listener in case of toggleSubmitButton failure/error
  form.addEventListener("submit", function (event) {
    validateUsername();
    validateEmail();
    validatePassword();
    validateConfirmPassword();

    const errors = document.querySelectorAll(".error-message:not(:empty)");
    if (errors.length > 0) {
      event.preventDefault();
    }
  });

  toggleSubmitButton();
});
