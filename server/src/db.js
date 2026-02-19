const Database = require("better-sqlite3");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "expenses.db");

let db;

/**
 * Initialises the SQLite database and creates the expenses table
 * if it doesn't already exist.
 *
 * amount is stored as an INTEGER in paise (1 ₹ = 100 paise)
 * to avoid floating-point rounding errors when dealing with money.
 */
function getDb() {
  if (db) return db;

  db = new Database(DB_PATH);

  // Enable WAL mode for better concurrent read performance
  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS expenses (
      id              TEXT PRIMARY KEY,
      amount          INTEGER NOT NULL,
      category        TEXT    NOT NULL,
      description     TEXT    NOT NULL,
      date            TEXT    NOT NULL,
      created_at      TEXT    NOT NULL,
      idempotency_key TEXT    UNIQUE
    )
  `);

  return db;
}

/**
 * Close the database connection (useful for tests).
 */
function closeDb() {
  if (db) {
    db.close();
    db = undefined;
  }
}

module.exports = { getDb, closeDb };
