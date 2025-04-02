// =========================
// SERVER.JS - MAIN SERVER SETUP
// =========================
// This file sets up the Express server for the file uploader application,
// imports required middleware, and defines the routing for the application.
//
// Sections:
// 1. Setup and Imports
// 2. Middleware Configuration
// 3. Route Configuration
// 4. Server Start
// =========================

// =========================
// 1. SETUP AND IMPORTS
// =========================
require("dotenv").config();

const express = require("express");
const path = require("node:path");
const session = require("express-session");
const passport = require("./config/passport");
const CustomPrismaSessionStore = require("./config/customPrismaSessionStore");
const prisma = require("./config/prisma");
const DatabaseError = require("./errors/DatabaseError");
const multer = require("multer");

const loginRouter = require("./routes/loginRouter");
const logoutRouter = require("./routes/logoutRouter");
const signUpRouter = require("./routes/signUpRouter");
const landingRouter = require("./routes/landingRouter");
const uploadRouter = require("./routes/uploadRouter");
const viewUserFilesRouter = require("./routes/viewUserFilesRouter");

const app = express();

// =========================
// 2. MIDDLEWARE CONFIGURATION
// =========================
// Set up template engine for EJS + template directory
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Middleware to parse URL-encoded data, required for form submissions
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON data, required for API requests like PATCH
app.use(express.json());

// Middleware to serve static files from 'public' folder (CSS, JS, etc.)
app.use(express.static(path.join(__dirname, "public")));

const customStore = new CustomPrismaSessionStore(prisma, {
  dbRecordIdIsSessionId: true,
  checkPeriod: 1000 * 60 * 2, // Run cleanup every 2 minutes
  sessionDataProperty: "data", // Ensures the session data is correctly mapped
});

// Passport set up for user authentication
app.use(
  session({
    secret: process.env.SESSION_SECRET, // session secret
    resave: false, // Don't save session if unmodified
    saveUninitialized: false, // Don't create sessions until they are modified
    store: customStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // Set cookie experation time to 1 day
    },
  })
);

// Init passport and restore authentication state from the session
app.use(passport.initialize());
app.use(passport.session());

// Set up to ensure a logged in user is available across all views
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

// =========================
// 3. ROUTE CONFIGURATION
// =========================
app.use("/upload", uploadRouter());
app.use("/sign-up", signUpRouter());
app.use("/login", loginRouter());
app.use("/logout", logoutRouter());
app.use("/files", viewUserFilesRouter());
app.use("/", landingRouter());

// catch non-existant routes/pages
app.use((req, res, next) => {
  const err = new Error("The page you are looking for does not exist.");
  err.statusCode = 404;
  next(err);
});

// global error handler
app.use((err, req, res, next) => {
  // Multer-specific errors
  if (err instanceof multer.MulterError) {
    const errors = [];
    if (err.code === "LIMIT_FILE_SIZE") {
      errors.push({ msg: "One of more files exceed the 5MB limit." });
    } else if (err.code === "LIMIT_FIELD_COUNT") {
      errors.push({ msg: "Too many files! Maximum of 10." });
    }

    return res.status(400).render("upload", {
      errors,
    });
  }

  // Database-specific errors
  if (err instanceof DatabaseError) {
    return res.status(500).render("error", {
      title: "Error",
      error: "Something went wrong. Please try again later.",
    });
  }

  // Generic errors
  res.status(err.statusCode || 500).render("error", {
    title: "Error",
    error: err.message || "Internal Server Error",
  });
});

// =========================
// 4. SERVER START
// =========================
app.listen(process.env.PORT, () => {
  console.log(
    `Express app - listening on ${process.env.HOST}:${process.env.PORT}`
  );
});
