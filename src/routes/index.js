import express from "express"
import userRoutes from "./user.routes.js"
import authRoutes from "./auth.routes.js"
import professionalRoutes from "./professional.routes.js"
import serviceRoutes from "./service.routes.js"
import addonsRoutes from "./addon.routes.js"
import bookingRoutes from "./booking.route.js"
import reviewRoutes from "./review.routes.js"

const router = express.Router()

// Mount all route modules here
router.use("/users", userRoutes)
router.use("/auth", authRoutes)
router.use("/pro", professionalRoutes)
router.use("/services", serviceRoutes)
router.use("/addons", addonsRoutes)
router.use("/bookings", bookingRoutes)
router.use("/reviews", reviewRoutes)


export default router