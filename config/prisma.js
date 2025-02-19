// =========================
// PRISMA.JS CONFIG
// =========================
// This file sets up a single Prisma client which can be imported and used by
// all other files.
// =========================

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

module.exports = prisma;
