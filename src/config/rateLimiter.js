import rateLimit from "express-rate-limit"

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 10, // allow max 10 attempts per key
    message: {
        success: false,
        error: {
            code: "RATE_LIMIT",
            message: "Too many login attempts, please try again later"
        }
    },
    keyGenerator: (req, res) => {
        // Prefer email if present, else fallback to IP
        return req.body?.email || req.ip
    }
})
