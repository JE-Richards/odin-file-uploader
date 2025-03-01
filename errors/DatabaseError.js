class DatabaseError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 500;
    this.name = "DatabaseError";
  }
}

module.exports = DatabaseError;
