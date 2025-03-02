// =========================
// PASSPORT.JS CONFIG - LOCAL STRATEGY (AUTHENTICATION)
// =========================
// This file sets up Passport with a local strategy for handling user login,
// using the username and password to authenticate users.
//
// Sections:
// 1. Setup and Imports
// 2. Local Strategy - Authentication Logic
// 3. Serialize and Deserialize User
// 4. Export
// =========================

// =========================
// 1. SETUP AND IMPORTS
// =========================
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const prisma = require("./prisma");
const NotFoundError = require("../errors/NotFoundError");
const DatabaseError = require("../errors/DatabaseError");
const { getUserById, getUserByUsername } = require("../services/userService");

// =========================
// 2. LOCAL STRATEGY - AUTHENTICATION LOGIC
// =========================
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await getUserByUsername(username);

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: "Password is incorrect." });
      }

      return done(null, user);
    } catch (err) {
      if (err instanceof NotFoundError) {
        return done(null, false, { message: `User ${username} not found.` });
      }

      if (err instanceof DatabaseError) {
        return done(null, false, {
          message: "Database connection issue. Please try again later.",
        });
      }

      return done(err);
    }
  })
);

// =========================
// 3. SERIALIZE AND DESERIALIZE USER
// =========================
// The following methods manage user data across requests by storing a unique
// identifier (user id) in the session and retrieving the user object for each request.
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await getUserById(id);

    done(null, user);
  } catch (err) {
    done(err);
  }
});

// =========================
// 4. EXPORT
// =========================
module.exports = passport;
