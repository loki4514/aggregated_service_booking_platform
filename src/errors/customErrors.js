// errors/customErrors.js
export class CustomError extends Error {
    constructor(message, code, status = 500) {
        super(message)
        this.name = this.constructor.name
        this.code = code
        this.status = status
        Error.captureStackTrace(this, this.constructor)
    }
}

export class ValidationError extends CustomError {
    constructor(message, code = "VALIDATION_ERROR") {
        super(message, code, 400)
    }
}

export class NotFoundError extends CustomError {
    constructor(message, code = "NOT_FOUND") {
        super(message, code, 404)
    }
}


export class UnauthorizedError extends CustomError {
    constructor(message, code = "UNAUTHORIZED") {
        super(message, code, 401)
    }
}


export class ForbiddenError extends CustomError {
    constructor(message, code = "FORBIDDEN") {
        super(message, code, 403)  // ✅ correct status code
    }
}


export class ConflictError extends CustomError {
    constructor(message, code = "CONFLICT") {
        super(message, code, 409)
    }
}