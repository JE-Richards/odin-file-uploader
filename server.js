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
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const prisma = require("./config/prisma");
const DatabaseError = require("./errors/DatabaseError");

const loginRouter = require("./routes/loginRouter");
const signUpRouter = require("./routes/signUpRouter");
const landingRouter = require("./routes/landingRouter");

const app = express();

// =========================
// 2. MIDDLEWARE CONFIGURATION
// =========================
// Set up template engine for EJS + template directory
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Middleware to parse URL-encoded data, required for form submissions
app.use(express.urlencoded({ extended: true }));

// Middleware to serve static files from 'public' folder (CSS, JS, etc.)
app.use(express.static(path.join(__dirname, "public")));

// Passport set up for user authentication
app.use(
  session({
    secret: process.env.SESSION_SECRET, // session secret
    resave: false, // Don't save session if unmodified
    saveUninitialized: false, // Don't create sessions until they are modified
    store: new PrismaSessionStore(
      prisma, // prisma client instance - no tablename needed as schema table is named Session
      {
        dbRecordIdIsSessionId: true,
      }
    ),
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

app.use("/sign-up", signUpRouter());
app.use("/login", loginRouter());
app.use("/", landingRouter());

// catch non-existant routes/pages
app.use((req, res, next) => {
  const err = new Error("The page you are looking for does not exist.");
  err.statusCode = 404;
  next(err);
});

// global error handler
app.use((err, req, res, next) => {
  if (err instanceof DatabaseError) {
    return res.status(500).render("error", {
      title: "Error",
      error: "Something went wrong. Please try again later.",
    });
  }

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
