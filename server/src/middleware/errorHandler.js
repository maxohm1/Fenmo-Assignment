/**
 * Central error handler.
 * Catches thrown errors and returns a consistent JSON response.
 */
function errorHandler(err, _req, res, _next) {
    console.error("Unhandled error:", err);

    const status = err.status || 500;
    res.status(status).json({
        error: {
            message: err.message || "Internal server error",
        },
    });
}

module.exports = { errorHandler };
