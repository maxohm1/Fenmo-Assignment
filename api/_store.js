const { v4: uuidv4 } = require("uuid");

/**
 * In-memory expense store for Vercel serverless deployment.
 *
 * Trade-off: Data persists while the serverless function is warm but
 * resets on cold starts. For a production app you'd swap this for a
 * hosted database (e.g. Vercel Postgres, PlanetScale, Turso).
 *
 * Money is still stored as integer paise internally.
 */

const expenses = [];
const idempotencyMap = new Map();

function createExpense(data, idempotencyKey) {
    // Idempotency check
    if (idempotencyKey && idempotencyMap.has(idempotencyKey)) {
        return { expense: idempotencyMap.get(idempotencyKey), created: false };
    }

    const expense = {
        id: uuidv4(),
        amount: Math.round(data.amount * 100), // store as paise
        category: data.category.trim(),
        description: data.description.trim(),
        date: data.date,
        created_at: new Date().toISOString(),
    };

    expenses.push(expense);

    if (idempotencyKey) {
        idempotencyMap.set(idempotencyKey, expense);
    }

    return { expense, created: true };
}

function getExpenses({ category, sort } = {}) {
    let result = [...expenses];

    if (category) {
        result = result.filter(
            (e) => e.category.toLowerCase() === category.toLowerCase()
        );
    }

    if (sort === "date_desc") {
        result.sort((a, b) => b.date.localeCompare(a.date) || b.created_at.localeCompare(a.created_at));
    } else {
        result.sort((a, b) => b.created_at.localeCompare(a.created_at));
    }

    return result;
}

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

function validateExpense(body) {
    const errors = [];
    if (body.amount === undefined || body.amount === null) errors.push("amount is required");
    else if (typeof body.amount !== "number" || isNaN(body.amount)) errors.push("amount must be a number");
    else if (body.amount <= 0) errors.push("amount must be greater than zero");

    if (!body.category || typeof body.category !== "string" || !body.category.trim())
        errors.push("category is required and must be a non-empty string");

    if (!body.description || typeof body.description !== "string" || !body.description.trim())
        errors.push("description is required and must be a non-empty string");

    if (!body.date) errors.push("date is required");
    else if (isNaN(new Date(body.date).getTime()))
        errors.push("date must be a valid date string (e.g. 2025-01-15)");

    return errors;
}

module.exports = { createExpense, getExpenses, formatExpense, validateExpense };
