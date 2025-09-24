import Joi from "joi"

export const priceEstimateSchema = Joi.object({
    professionalId: Joi.string()
        .uuid()
        .required()
        .messages({
            "string.base": "Professional ID must be a string",
            "string.guid": "Professional ID must be a valid UUID",
            "any.required": "Professional ID is required"
        }),

    serviceId: Joi.string()
        .uuid()
        .required()
        .messages({
            "string.base": "Service ID must be a string",
            "string.guid": "Service ID must be a valid UUID",
            "any.required": "Service ID is required"
        }),

    addonIds: Joi.array()
        .items(
            Joi.string().uuid().messages({
                "string.guid": "Addon ID must be a valid UUID"
            })
        )
        .optional()
        .messages({
            "array.base": "Addon IDs must be an array"
        })
}).options({ stripUnknown: true })


export const createBookingSchema = Joi.object({
    professionalId: Joi.string().uuid().required().messages({
        "string.empty": "Professional ID is required",
        "string.guid": "Professional ID must be a valid UUID"
    }),
    serviceId: Joi.string().uuid().required().messages({
        "string.empty": "Service ID is required",
        "string.guid": "Service ID must be a valid UUID"
    }),
    slotId: Joi.string().uuid().required().messages({
        "string.empty": "Slot ID is required",
        "string.guid": "Slot ID must be a valid UUID"
    }),
    addressId: Joi.string().uuid().required().messages({
        "string.empty": "Address ID is required",
        "string.guid": "Address ID must be a valid UUID"
    }),
    addonIds: Joi.array()
        .items(Joi.string().uuid().messages({ "string.guid": "Addon ID must be a valid UUID" }))
        .optional(),
    notes: Joi.string().max(500).optional()
}).options({ stripUnknown: true, convert: true })

export const statusQuerySchema = Joi.object({
    status: Joi.string()
        .uppercase()
        .valid("PENDING", "CONFIRMED", "COMPLETED", "CANCELLED")
        .insensitive()
        .optional()
        .messages({
            "any.only": "Status must be one of: PENDING, CONFIRMED, COMPLETED, or CANCELLED",
            "string.base": "Status must be a string"
        }),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
});

export const professionalBookingUpdateSchema = Joi.object({
    status: Joi.string()
        .uppercase()
        .valid("CONFIRMED", "COMPLETED", "CANCELLED")
        .required()
        .messages({
            "any.only": "Status must be either CONFIRMED, COMPLETED or CANCELLED"
        }),
    cancellationReason: Joi.string().when("status", {
        is: "CANCELLED",
        then: Joi.required().messages({
            "any.required": "Cancellation reason is required when cancelling a booking"
        }),
        otherwise: Joi.optional()
    })
});

