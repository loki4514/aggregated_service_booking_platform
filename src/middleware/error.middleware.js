
import logger from "../config/logger.js"

export function errorHandler(err, req, res, next) {
    // Log the full error
    logger.error("Unhandled error", {
        path: req.originalUrl,
        method: req.method,
        message: err.message,
        stack: err.stack,
    })

    // Pick status code
    const statusCode = err.status || 500

    // Structured error response
    res.status(statusCode).json({
        success: false,
        error: {
            code: err.code || "INTERNAL_ERROR",
            message: err.message || "Something went wrong",
        },
    })
}
