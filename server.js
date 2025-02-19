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

const app = express();

// =========================
// 2. MIDDLEWARE CONFIGURATION
// =========================
// Passport set up for user authentication
app.use(
  session({
    secret: process.env.SESSION_SECRET, // session secret
    resave: false, // Don't save session if unmodified
    saveUninitialized: false, // Don't create sessions until they are modified
    store: new PrismaSessionStore({
      prisma, // prisma client instance - no tablename needed as schema table is named Session
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // Set cookie experation time to 1 day
    },
  })
);

// Init passport and restore authentication state from the session
app.use(passport.initialize());
app.use(passport.session());

// =========================
// 3. ROUTE CONFIGURATION
// =========================

// =========================
// 4. SERVER START
// =========================
app.listen(process.env.PORT, () => {
  console.log(
    `Express app - listening on ${process.env.HOST}:${process.env.PORT}`
  );
});
