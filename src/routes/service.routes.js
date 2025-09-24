import express from "express"
import { ServiceController } from "../controllers/service.controller.js"
import { authMiddleware } from "../middleware/auth.middleware.js"
const router = express.Router()
const controller = new ServiceController()

// GET /api/v1/services?q=term
router.get("/search", authMiddleware, controller.search)

// GET /api/v1/services
router.get("/", authMiddleware, controller.getAll)

// GET /api/v1/services/:id
router.get("/:id", authMiddleware, controller.getById)

export default router
