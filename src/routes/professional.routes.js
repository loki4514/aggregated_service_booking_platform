import express from "express"
import { ProfessionalController } from "../controllers/professional.controller.js"
import { validateBody } from "../middleware/validation.middleware.js"
import { professionalSignupSchema } from "../validators/professional.validator.js"
import { authMiddleware } from "../middleware/auth.middleware.js"

const router = express.Router()
const controller = new ProfessionalController()

router.post(
    "/signup",
    validateBody(professionalSignupSchema),
    controller.createProfessional
)

router.get("/nearby", authMiddleware, controller.getNearby)

router.get("/by-service/:serviceId", authMiddleware, controller.getByService);
export default router