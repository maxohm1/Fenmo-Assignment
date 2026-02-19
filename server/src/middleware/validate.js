/**
 * Validates the request body for creating an expense.
 * Returns an array of error messages (empty if valid).
 */
function validateExpense(body) {
    const errors = [];

    // --- amount ---
    if (body.amount === undefined || body.amount === null) {
        errors.push("amount is required");
    } else if (typeof body.amount !== "number" || isNaN(body.amount)) {
        errors.push("amount must be a number");
    } else if (body.amount <= 0) {
        errors.push("amount must be greater than zero");
    }

    // --- category ---
    if (!body.category || typeof body.category !== "string" || !body.category.trim()) {
        errors.push("category is required and must be a non-empty string");
    }

    // --- description ---
    if (!body.description || typeof body.description !== "string" || !body.description.trim()) {
        errors.push("description is required and must be a non-empty string");
    }

    // --- date ---
    if (!body.date) {
        errors.push("date is required");
    } else {
        const parsed = new Date(body.date);
        if (isNaN(parsed.getTime())) {
            errors.push("date must be a valid date string (e.g. 2025-01-15)");
        }
    }

    return errors;
}

module.exports = { validateExpense };
