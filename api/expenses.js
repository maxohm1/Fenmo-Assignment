const { createExpense, getExpenses, formatExpense, validateExpense } = require("./_store");

module.exports = function handler(req, res) {
    // Enable CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Idempotency-Key");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    try {
        if (req.method === "POST") {
            const errors = validateExpense(req.body);
            if (errors.length > 0) {
                return res.status(400).json({ error: { message: "Validation failed", details: errors } });
            }

            const idempotencyKey = req.headers["idempotency-key"] || null;
            const { expense, created } = createExpense(req.body, idempotencyKey);

            return res.status(created ? 201 : 200).json(formatExpense(expense));
        }

        if (req.method === "GET") {
            const { category, sort } = req.query;
            const rows = getExpenses({ category, sort });
            return res.status(200).json(rows.map(formatExpense));
        }

        res.status(405).json({ error: { message: "Method not allowed" } });
    } catch (err) {
        console.error("API error:", err);
        res.status(500).json({ error: { message: "Internal server error" } });
    }
};
