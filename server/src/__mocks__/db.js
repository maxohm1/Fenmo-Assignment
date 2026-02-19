const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const TEST_DB = path.join(__dirname, "..", "..", "test-expenses.db");

// Ensure a fresh DB for each test run
if (fs.existsSync(TEST_DB)) fs.unlinkSync(TEST_DB);

const db = new Database(TEST_DB);
db.pragma("journal_mode = WAL");
db.exec(
    "CREATE TABLE IF NOT EXISTS expenses (" +
    "id TEXT PRIMARY KEY, " +
    "amount INTEGER NOT NULL, " +
    "category TEXT NOT NULL, " +
    "description TEXT NOT NULL, " +
    "date TEXT NOT NULL, " +
    "created_at TEXT NOT NULL, " +
    "idempotency_key TEXT UNIQUE)"
);

function getDb() {
    return db;
}

function closeDb() {
    db.close();
}

module.exports = { getDb, closeDb };
