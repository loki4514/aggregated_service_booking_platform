import express from "express"
import { AddonController } from "../controllers/addon.controller.js"
import { authMiddleware } from "../middleware/auth.middleware.js"

const router = express.Router()
const controller = new AddonController()

// List addons under a service
router.get("/service/:serviceId", authMiddleware, controller.getByService)

// List addons offered by a professional
router.get("/professional/:professionalId", authMiddleware, controller.getByProfessional)

export default router
