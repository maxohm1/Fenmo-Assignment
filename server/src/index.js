const express = require("express");
const cors = require("cors");
const expenseRoutes = require("./routes/expenses");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Routes ---
app.use("/expenses", expenseRoutes);

// Health check
app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});

// --- Error handling ---
app.use(errorHandler);

// --- Start server (skip when running tests) ---
if (process.env.NODE_ENV !== "test") {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;
