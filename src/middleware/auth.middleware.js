import jwt from "jsonwebtoken"
import { JWT_SECRET } from "../config/constants.js"
import { prisma } from "../config/database.js"
import { ForbiddenError, UnauthorizedError } from "../errors/customErrors.js"


export async function authMiddleware(req, res, next) {
    
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(new UnauthorizedError("Missing or invalid token", "AUTH_REQUIRED"))
    }

    try {
        const token = authHeader.split(" ")[1]
        const payload = jwt.verify(token, JWT_SECRET)

        // 🔹 Check user in DB
        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: { id: true, role: true, email: true, isActive: true }
        })

        if (!user) {
            return next(new UnauthorizedError("User not found", "USER_NOT_FOUND"))
        }

        if (!user.isActive) {
            return next(new ForbiddenError("User account is deactivated", "USER_INACTIVE"))
        }

        // Attach to req.user
        req.user = {
            userId : user.id,
            role: user.role,
            email: user.email
        }

    
    

        next()
    } catch (err) {
        return next(new UnauthorizedError("Invalid or expired token", "INVALID_TOKEN"))
    }
}
