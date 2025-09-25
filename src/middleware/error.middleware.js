
import logger from "../config/logger.js"

export function errorHandler(err, req, res, next) {
    // Always log the real error for internal visibility
    logger.error("Unhandled error", {
        path: req.originalUrl,
        method: req.method,
        message: err.message,
        stack: err.stack,
    });

    // Pick status code (default 500)
    const statusCode = err.status || 500;

    // Only expose safe messages
    // const safeMessage = err.isOperational   // e.g. your custom AppError
    //     ? err.message                       // safe to show
    //     : "Something went wrong, please try again later.";

    res.status(statusCode).json({
        success: false,
        error: {
            code: err.code || "INTERNAL_ERROR",
            message: err.message || "Something went wrong, please try again later.",
        },
    });
}
