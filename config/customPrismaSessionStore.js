// =========================
// CUSTOM PRISMA SESSION STORE
// =========================
// This extends PrismaSessionStore to populate the userId field in the sessions
// table based on the authenticated user's ID from Passport.
//
// Sections:
// 1. Setup
// 2. CustomPrismaSessionStore
// 3. Export
// =========================

// =========================
// 1. SETUP
// =========================
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");

// =========================
// 2. CUSTOMPRISMASESSIONSTORE
// =========================
class CustomPrismaSessionStore extends PrismaSessionStore {
  constructor(prisma, options) {
    super(prisma, options); // Pass prisma client and options from parent
    this.prisma = prisma; // Ensure prisma is available in this instance

    // using an arrow function here automatically binds `this` to the class instance
    this.set = (sid, session, callback) => {
      // Extract the userId from passport.user (set by Passport.serializeUser) or default to null
      const userId = session.passport?.user || null;

      // Set experation based on cookie or default to 24 hours from now
      const expires =
        session.cookie.expires || new Date(Date.now() + 24 * 60 * 60 * 1000);

      // Serialise session to JSON
      const data = JSON.stringify(session);

      // upsert: updates existing record if exists, else inserts new record
      this.prisma.session
        .upsert({
          where: { sid },
          update: {
            data,
            expiresAt: expires,
            user: userId ? { connect: { id: userId } } : { disconnect: true },
          },
          create: {
            id: sid,
            sid,
            data,
            expiresAt: expires,
            ...(userId && { user: { connect: { id: userId } } }), // if userId is truthy, then connect
          },
        })
        .then((result) => {
          // console.log("Upsert result:", result);
          callback(null);
        })
        .catch((err) => {
          // console.error("Upsert failed in custom set:", err);
          callback(err);
        });
    };

    console.log("CustomPrismaSessionStore constructor called"); // Verify the custom constructor has been called
  }
}

// =========================
// 3. EXPORT
// =========================
module.exports = CustomPrismaSessionStore;
