const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { getDb } = require("../db");
const { validateExpense } = require("../middleware/validate");

const router = express.Router();

/**
 * POST /expenses
 *
 * Creates a new expense entry.
 *
 * Accepts an optional Idempotency-Key header. If a matching key already
 * exists in the database the original expense is returned instead of
 * creating a duplicate — this makes the endpoint safe for client retries.
 *
 * The amount arrives as a decimal (e.g. 49.99) and is stored internally
 * as an integer of paise (4999) to avoid floating-point rounding issues.
 */
router.post("/", (req, res, next) => {
    try {
        const errors = validateExpense(req.body);
        if (errors.length > 0) {
            return res.status(400).json({ error: { message: "Validation failed", details: errors } });
        }

        const db = getDb();
        const idempotencyKey = req.headers["idempotency-key"] || null;

        // If the client sent an idempotency key, check for an existing expense
        if (idempotencyKey) {
            const existing = db
                .prepare("SELECT * FROM expenses WHERE idempotency_key = ?")
                .get(idempotencyKey);

            if (existing) {
                return res.status(200).json(formatExpense(existing));
            }
        }

        const id = uuidv4();
        const amountPaise = Math.round(req.body.amount * 100);
        const now = new Date().toISOString();

        db.prepare(
            `INSERT INTO expenses (id, amount, category, description, date, created_at, idempotency_key)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).run(
            id,
            amountPaise,
            req.body.category.trim(),
            req.body.description.trim(),
            req.body.date,
            now,
            idempotencyKey
        );

        const expense = db.prepare("SELECT * FROM expenses WHERE id = ?").get(id);
        res.status(201).json(formatExpense(expense));
    } catch (err) {
        next(err);
    }
});

/**
 * GET /expenses
 *
 * Returns all expenses. Supports optional query parameters:
 *   ?category=Food       — filter by category (case-insensitive)
 *   ?sort=date_desc      — sort by date, newest first
 */
router.get("/", (req, res, next) => {
    try {
        const db = getDb();
        const { category, sort } = req.query;

        let query = "SELECT * FROM expenses";
        const params = [];

        if (category) {
            query += " WHERE LOWER(category) = LOWER(?)";
            params.push(category);
        }

        if (sort === "date_desc") {
            query += " ORDER BY date DESC, created_at DESC";
        } else {
            query += category ? " ORDER BY created_at DESC" : " ORDER BY created_at DESC";
        }

        const rows = db.prepare(query).all(...params);
        res.json(rows.map(formatExpense));
    } catch (err) {
        next(err);
    }
});

/**
 * Converts the internal DB row (amount in paise) to a
 * client-friendly object (amount as a decimal number).
 */
function formatExpense(row) {
    return {
        id: row.id,
        amount: row.amount / 100,
        category: row.category,
        description: row.description,
        date: row.date,
        created_at: row.created_at,
    };
}

module.exports = router;
