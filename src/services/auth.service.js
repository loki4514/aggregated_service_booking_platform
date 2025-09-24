
import { compareSecret } from "../utils/password.hash.js"
import logger from "../config/logger.js"
import { generateToken } from "../utils/jwt.js"
import { ForbiddenError, UnauthorizedError } from "../errors/customErrors.js"
import { UserRepository } from "../repository/user.repository.js"

export class AuthService {
    constructor() {
        this.userRepo = new UserRepository()
    }

    async login({ email, password }) {
        try {
            const user = await this.userRepo.findByEmail(email)
            if (!user) {
                throw new UnauthorizedError("Invalid credentials", "INVALID_CREDENTIALS")
            }

            if (!user.isActive) {
                throw new ForbiddenError("User account is deactivated", "USER_INACTIVE")
            }

            const validPassword = await compareSecret(password, user.password)
            if (!validPassword) {
                throw new UnauthorizedError("Invalid credentials", "INVALID_CREDENTIALS")
            }

            const payload = { userId: user.id, role: user.role, email: user.email }
            const token = generateToken(payload)

            logger.info("AuthService - User logged in", { id: user.id })
            return token
        } catch (err) {
            logger.error("AuthService - Login failed", { error: err.message })
            throw err
        }
    }
}
