// =========================
// USER SERVICE
// =========================
// Handles user-related database operations using Prisma.
// This service abstracts database interactions for creating and managing users.
//
// Sections:
// 1. Setup
// 2. User Functions
//    2.1. createUser
// 3. Export
// =========================

// =========================
// 1. SETUP
// =========================
const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");
const ValidationError = require("../errors/ValidationError");
const handlePrismaError = require("../utils/prismaErrorHandler");

// =========================
// 2. USER FUNCTIONS
// =========================
// =========================
// 2.1. CREATEUSER
// =========================
// Handles new user creation by valedating uniqueness, hashing the password, and
// storing the user in the database.
// =========================
async function createUser({ email, password, username }) {
  try {
    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      throw new ValidationError("Email is already registered.");
    }

    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUsername) {
      throw new ValidationError("Username is already taken.");
    }

    // Create user if username & email not taken
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, username, password: hashedPassword },
    });

    return user;
  } catch (err) {
    handlePrismaError(err);
  }
}

// =========================
// 3. EXPORT
// =========================
module.exports = { createUser };
