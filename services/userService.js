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
//    2.2. getUserById
//    2.3. getUserByUsername
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
// 2. USER FUNCTIONS
// =========================
// =========================
// 2.1. CREATEUSER
// =========================
// Handles new user creation by valedating uniqueness, hashing the password, and
// storing the user in the database.
//
// Parameters:
// - email (string): The email submitted by the user.
// - password (string): The password chosen by the user.
// - username (string): The username chosen by the user.
//
// Returns:
// - A new user in the User database table.
//
// Throws:
// - ValidationError: If an email is already registered or if a username is
// already taken.
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
// 2.2. GETUSERBYID
// =========================
// Retrieves a user from the database by their ID.
//
// Parameters:
// - id (string): The unique identifier of the user.
//
// Returns:
// - A user object if found.
//
// Throws:
// - NotFoundError: If no user exists with the given ID.
// =========================
async function getUserById(id) {
  try {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) throw new NotFoundError("user", { id });

    return user;
  } catch (err) {
    handlePrismaError(err);
  }
}

// =========================
// 2.3. GETUSERBYUSERNAME
// =========================
// Retrieves a user from the database by their username.
//
// Parameters:
// - username (string): The username to search for.
//
// Returns:
// - A user object if found.
//
// Throws:
// - NotFoundError: If no user exists with the given username.
// =========================
async function getUserByUsername(username) {
  try {
    const user = await prisma.user.findUnique({ where: { username } });

    if (!user) throw new NotFoundError("user", { username });

    return user;
  } catch (err) {
    handlePrismaError(err);
  }
}

// =========================
// 3. EXPORT
// =========================
module.exports = { createUser, getUserById, getUserByUsername };
