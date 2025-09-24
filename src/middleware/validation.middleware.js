import { ValidationError } from "../errors/customErrors.js"

export function validateBody(schema) {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body)
        
        if (error) {
            const message = error.details.map(detail => detail.message).join(", ")
            return next(new ValidationError(message, "VALIDATION_ERROR"))
        }
        
        // Replace req.body with validated and sanitized data
        req.body = value
       
        next()
    }
}

export function validateParams(schema) {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.params)
        
        if (error) {
            const message = error.details.map(detail => detail.message).join(", ")
            return next(new ValidationError(message, "VALIDATION_ERROR"))
        }
        
        req.params = value
        console.log("alid")
        next()
    }
}

export function validateQuery(schema) {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.query)
        
        if (error) {
            const message = error.details.map(detail => detail.message).join(", ")
            return next(new ValidationError(message, "VALIDATION_ERROR"))
        }
        
        req.query = value
        next()
    }
}