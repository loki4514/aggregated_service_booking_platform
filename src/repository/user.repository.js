
import { prisma } from "../config/database.js";
import logger from "../config/logger.js";


export class UserRepository {
    async create(data) {
        try {
            const user = await prisma.user.create({ data })
            logger.info("UserRepository", "User created", { id: user.id })
            return user
        } catch (err) {
            logger.error("UserRepository", "Failed to create user", { error: err.message })
            throw err
        }
    }

    async update(userId, data) {
        try {
            const user = await prisma.user.update({
                where: { id: userId },
                data
            })
            logger.info("UserRepository", "User updated", { id: user.id })
            return user
        } catch (err) {
            logger.error("UserRepository", "Failed to update user", { error: err.message })
            throw err
        }
    }

    async findByEmail(email) {
        return prisma.user.findUnique({ where: { email } })
    }

    async findByPhoneNumber(phone){
        return prisma.user.findUnique({where : {phone}})
    }

    async findById(id) {
        return prisma.user.findUnique({ where: { id } })
    }
}