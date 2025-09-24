import express from "express"
import { AuthController } from "../controllers/auth.controller.js"
import { validateBody } from "../middleware/validation.middleware.js"
import { loginSchema } from "../validators/auth.validator.js"
import { authLimiter } from "../config/rateLimiter.js"

const router = express.Router()
const authController = new AuthController()

router.post(
    "/login",
    authLimiter,
    validateBody(loginSchema),
    authController.login
)

export default router