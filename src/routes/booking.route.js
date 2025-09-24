import express from "express"
import { BookingController } from "../controllers/booking.controller.js"
import { authMiddleware } from "../middleware/auth.middleware.js"
import { validateBody, validateParams } from "../middleware/validation.middleware.js"
import { createBookingSchema, priceEstimateSchema, professionalBookingUpdateSchema } from "../validators/booking.validator.js"
import Joi from "joi"
import { authorizeRole } from "../middleware/authorizeRole.js"

const router = express.Router()
const bookingController = new BookingController()

// Estimate price - no ID in URL
router.post("/estimate",
    authMiddleware,
    validateBody(priceEstimateSchema),
    bookingController.estimatePrice
)

// Create booking - no ID in URL
router.post("/create-booking",
    authMiddleware,
    validateBody(createBookingSchema),
    bookingController.createBooking
)

// Get user's own bookings - no ID in URL
router.get("/my-bookings",
    authMiddleware,
    bookingController.getBookingsForCustomer
)

// Get professional's bookings - no ID in URL
router.get("/professional-bookings",
    authMiddleware,
    authorizeRole("PROFESSIONAL"),
    bookingController.getBookingsForProfessional
)

// Update booking status (for professionals)
router.patch("/:id/status",
    authMiddleware,
    authorizeRole("PROFESSIONAL"),
    validateParams(Joi.object({ id: Joi.string().uuid().required() })),
    validateBody(professionalBookingUpdateSchema),
    bookingController.updateBookingStatus
)

// // Cancel booking (for customers)
router.patch("/:id/cancel",
    authMiddleware,
    validateParams(Joi.object({ id: Joi.string().uuid().required() })),
    validateBody(
        Joi.object({
            cancellationReason: Joi.string()
                .required()
                .messages({
                    "string.base": "Cancellation reason must be a valid text",
                    "string.empty": "Cancellation reason cannot be empty",
                    "any.required": "Cancellation reason is required to cancel a booking"
                })
        })
    ),
    bookingController.cancelBooking
)

// Get specific booking by ID - MUST be at the end to avoid route conflicts
router.get("/:id",
    authMiddleware,
    validateParams(Joi.object({ id: Joi.string().uuid().required() })),
    bookingController.getBookingById
)

export default router