import Joi from "joi"
// Signup validation
export const signupSchema = Joi.object({
    email: Joi.string().email().required().messages({
        "string.empty": "Email is required",
        "string.email": "Please enter a valid email address"
    }),
    password: Joi.string().min(6).max(50).required().messages({
        "string.empty": "Password is required",
        "string.min": "Password must be at least 6 characters long",
        "string.max": "Password cannot be longer than 50 characters"
    }),
    phone: Joi.string().pattern(/^[0-9]{10}$/).required().messages({
        "string.empty": "Phone number is required",
        "string.pattern.base": "Phone number must be 10 digits"
    }),
    firstName: Joi.string().min(2).max(50).required().messages({
        "string.empty": "First name is required",
        "string.min": "First name must be at least 2 characters"
    }),
    lastName: Joi.string().min(2).max(50).required().messages({
        "string.empty": "Last name is required",
        "string.min": "Last name must be at least 2 characters"
    }),
    pincode: Joi.string().length(6).optional().messages({
        "string.length": "Pincode must be 6 digits"
    }),
    role: Joi.string().valid("CUSTOMER").default("CUSTOMER")
}).options({ stripUnknown: true })

// Address validation
export const updateUserSchema = Joi.object({
    firstName: Joi.string()
        .min(2)
        .max(50)
        .optional()
        .messages({
            "string.min": "First name must be at least 2 characters long",
            "string.max": "First name cannot exceed 50 characters"
        }),

    lastName: Joi.string()
        .min(2)
        .max(50)
        .optional()
        .messages({
            "string.min": "Last name must be at least 2 characters long",
            "string.max": "Last name cannot exceed 50 characters"
        }),

    phone: Joi.string()
        .pattern(/^[0-9]{10}$/)
        .optional()
        .messages({
            "string.pattern.base": "Phone number must be exactly 10 digits"
        }),

    pincode: Joi.string()
        .length(6)
        .optional()
        .messages({
            "string.length": "Pincode must be exactly 6 digits"
        }),

    password: Joi.string()
        .min(6)
        .max(50)
        .optional()
        .messages({
            "string.min": "Password must be at least 6 characters long",
            "string.max": "Password cannot exceed 50 characters"
        })
})
    .min(1) // ✅ at least one field must be provided
    .options({ stripUnknown: true })

export const addressSchema = Joi.object({
    label: Joi.string()
        .valid("Home", "Office")
        .optional()
        .messages({
            "any.only": "Label must be either 'Home' or 'Office'"
        }),

    line1: Joi.string()
        .max(255)
        .required()
        .messages({
            "string.empty": "Address line1 is required",
            "string.max": "Address line1 cannot be longer than 255 characters"
        }),

    line2: Joi.string()
        .max(255)
        .allow(null, "")
        .optional()
        .messages({
            "string.max": "Address line2 cannot be longer than 255 characters"
        }),

    city: Joi.string()
        .max(100)
        .required()
        .messages({
            "string.empty": "City is required",
            "string.max": "City cannot be longer than 100 characters"
        }),

    state: Joi.string()
        .max(100)
        .required()
        .messages({
            "string.empty": "State is required",
            "string.max": "State cannot be longer than 100 characters"
        }),

    country: Joi.string()
        .max(100)
        .required()
        .messages({
            "string.empty": "Country is required",
            "string.max": "Country cannot be longer than 100 characters"
        }),

    pincode: Joi.string()
        .length(6)
        .required()
        .messages({
            "string.empty": "Pincode is required",
            "string.length": "Pincode must be exactly 6 digits"
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

    isDefault: Joi.boolean()
        .default(false)
        .messages({
            "boolean.base": "isDefault must be true or false"
        })
}).options({ stripUnknown: true })



export const updateAddressSchema = Joi.object({
    label: Joi.string()
        .valid("Home", "Office")
        .optional()
        .messages({
            "any.only": "Label must be either 'Home' or 'Office'"
        }),

    line1: Joi.string()
        .max(255)
        .optional()
        .messages({
            "string.max": "Address line1 cannot be longer than 255 characters"
        }),

    line2: Joi.string()
        .max(255)
        .allow(null, "")
        .optional()
        .messages({
            "string.max": "Address line2 cannot be longer than 255 characters"
        }),

    city: Joi.string()
        .max(100)
        .optional()
        .messages({
            "string.max": "City cannot be longer than 100 characters"
        }),

    state: Joi.string()
        .max(100)
        .optional()
        .messages({
            "string.max": "State cannot be longer than 100 characters"
        }),

    country: Joi.string()
        .max(100)
        .optional()
        .messages({
            "string.max": "Country cannot be longer than 100 characters"
        }),

    pincode: Joi.string()
        .length(6)
        .optional()
        .messages({
            "string.length": "Pincode must be exactly 6 digits"
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

    isDefault: Joi.boolean()
        .optional()
        .messages({
            "boolean.base": "isDefault must be true or false"
        })
})
    .min(1) // ✅ require at least one field
    .options({ stripUnknown: true })

// Parameter validation
export const userIdSchema = Joi.object({
    userId: Joi.string().uuid().required()
})

export const addressIdSchema = Joi.object({
    addressId: Joi.string().uuid().required()
})