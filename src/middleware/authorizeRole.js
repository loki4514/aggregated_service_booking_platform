import { ForbiddenError } from "../errors/customErrors.js"



export function authorizeRole(...allowedRoles) {
    return (req, res, next) => {
        
        if (allowedRoles.includes(req.user.role)) {
            return next()
        }
        return next(new ForbiddenError("You do not have permission to access this resource", "FORBIDDEN_ROLE"))
    }
}