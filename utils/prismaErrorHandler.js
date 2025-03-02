// =========================
// PRISMA ERROR HANDLER
// =========================
// This defines a custom, reusable, error handler function to catch specific
// Prisma error codes. The function is to be called inside the `catch` block of
// an asynchronous function call and returns specific error messages based on
// the Prisma error code.
//
// Sections:
// 1. Setup
// 2. Error handling functions
//    2.1. handlePrismaError
// 3. Export
// =========================

// =========================
// 1. SETUP
// =========================
const ValidationError = require("../errors/ValidationError");
const DatabaseError = require("../errors/DatabaseError");
const NotFoundError = require("../errors/NotFoundError");

// =========================
// 2. CONTROLLER FUNCTIONS
// =========================
// =========================
// 2.1. HANDLEPRISMAERROR
// =========================
// handlePrismaError catches the following errors:
// - ValidationError: A custom error function defined in `./errors`
// - P1001: Can't reach the database server {datase_host}:{database_port}
// - P1002: The database server was reached but timed out
// - P2002: Unique constraint failed
// - Other: All other (unexpected) errors
// =========================
function handlePrismaError(err) {
  // Forward known validation errors
  if (err instanceof ValidationError || err instanceof NotFoundError) {
    throw err;
  }

  // Handle unique constraint error (P2002)
  // using err.meta?.target to check if the field actually exists
  if (err.code === "P2002" && err.meta?.target) {
    const field = err.meta.target.join(", ");
    throw new ValidationError(
      `The following field(s) must be unique: ${field}`
    );
  }

  // Handle database connection error (P1001);
  if (err.code === "P1001") {
    console.error("Prisma error: Database connection failed.");
    throw new DatabaseError(
      "Failed to connect to the database. Please try again later."
    );
  }

  // Handle query timeout error (P1002);
  if (err.code === "P1002") {
    console.error("Prisma error: Database query timed out.");
    throw new DatabaseError(
      "Database is taking too long to respond. Please try again later."
    );
  }

  // Log unexpected Prisma errors for debugging
  console.error("Unexpected Prisma error:", err);
  throw new DatabaseError("An unexpected database error occurred.");
}

// =========================
// 3. EXPORT
// =========================
module.exports = handlePrismaError;
