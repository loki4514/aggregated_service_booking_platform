import Joi from "joi"

export const professionalSignupSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            "string.email": "Please provide a valid email address",
            "string.empty": "Email is required"
        }),

    password: Joi.string()
        .min(6)
        .max(50)
        .required()
        .messages({
            "string.empty": "Password is required",
            "string.min": "Password must be at least 6 characters long",
            "string.max": "Password cannot exceed 50 characters"
        }),

    phone: Joi.string()
        .pattern(/^[0-9]{10}$/)
        .required()
        .messages({
            "string.empty": "Phone number is required",
            "string.pattern.base": "Phone number must be exactly 10 digits"
        }),

    firstName: Joi.string()
        .pattern(/^[A-Za-z\s]+$/)   // ✅ only letters and spaces
        .min(2)
        .max(50)
        .required()
        .messages({
            "string.empty": "First name is required",
            "string.pattern.base": "First name must only contain letters and spaces",
            "string.min": "First name must be at least 2 characters long",
            "string.max": "First name cannot exceed 50 characters"
        }),

    lastName: Joi.string()
        .pattern(/^[A-Za-z\s]+$/)   // ✅ only letters and spaces
        .min(2)
        .max(50)
        .required()
        .messages({
            "string.empty": "Last name is required",
            "string.pattern.base": "Last name must only contain letters and spaces",
            "string.min": "Last name must be at least 2 characters long",
            "string.max": "Last name cannot exceed 50 characters"
        }),

    businessName: Joi.string()
        .pattern(/^[A-Za-z0-9\s'&.,-]+$/) // ✅ allows letters, numbers, spaces, apostrophe, ampersand, dot, comma, dash
        .max(255)
        .required()
        .messages({
            "any.required": "Business name is required",
            "string.empty": "Business name is required",
            "string.pattern.base": "Business name contains invalid characters",
            "string.max": "Business name cannot exceed 255 characters"
        }),


    description: Joi.string()
        .max(500)
        .optional()
        .messages({
            "string.max": "Description cannot exceed 500 characters"
        }),

    experience: Joi.number()
        .min(0)
        .default(0)
        .messages({
            "number.base": "Experience must be a number",
            "number.min": "Experience cannot be negative"
        }),

    latitude: Joi.number()
        .min(-90)
        .max(90)
        .optional()
        .messages({
            "number.base": "Latitude must be a number",
            "number.min": "Latitude cannot be less than -90",
            "number.max": "Latitude cannot be greater than 90"
        }),

    longitude: Joi.number()
        .min(-180)
        .max(180)
        .optional()
        .messages({
            "number.base": "Longitude must be a number",
            "number.min": "Longitude cannot be less than -180",
            "number.max": "Longitude cannot be greater than 180"
        }),

    pincode: Joi.string()
        .pattern(/^[0-9]{6}$/)   // ✅ stricter: must be exactly 6 digits
        .optional()
        .messages({
            "string.pattern.base": "Pincode must be exactly 6 digits"
        })
}).options({ stripUnknown: true, convert: true })
