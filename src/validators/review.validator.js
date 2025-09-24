import Joi from "joi";

export const createReviewSchema = Joi.object({
    bookingId: Joi.string().uuid().required().messages({
        "any.required": "Booking ID is required",
        "string.guid": "Booking ID must be a valid UUID"
    }),
    rating: Joi.number().integer().min(1).max(5).required().messages({
        "any.required": "Rating is required",
        "number.min": "Rating must be at least 1",
        "number.max": "Rating cannot be more than 5"
    }),
    comment: Joi.string().max(500).optional().messages({
        "string.max": "Comment cannot exceed 500 characters"
    })
});
