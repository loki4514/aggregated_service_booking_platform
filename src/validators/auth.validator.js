
import Joi from "joi"

export const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        "string.empty": "Email is required",
        "string.email": "Invalid email format"
    }),
    password: Joi.string().min(6).max(50).required().messages({
        "string.empty": "Password is required",
        "string.min": "Password must be at least 6 characters"
    })
})
