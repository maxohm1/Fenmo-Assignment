const express = require("express");
const cors = require("cors");
const path = require("path");
const expenseRoutes = require("./routes/expenses");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- API Routes ---
app.use("/expenses", expenseRoutes);

// Health check
app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});

// --- Serve React frontend in production ---
const clientBuild = path.join(__dirname, "..", "..", "client", "dist");
app.use(express.static(clientBuild));

// For any non-API route, serve the React app (SPA client-side routing)
app.get("*", (_req, res) => {
    res.sendFile(path.join(clientBuild, "index.html"));
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
