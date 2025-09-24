import { prisma } from "../config/database.js"
import logger from "../config/logger.js"
import { Prisma } from "@prisma/client"
import { ConflictError } from "../errors/customErrors.js"

export class BookingAddonRepository {
    async create(bookingId, addonId, quantity = 1) {
        try {
            return await prisma.bookingAddon.create({
                data: {
                    bookingId,
                    addonId,
                    quantity
                },
                include: { addon: true } // optional: fetch addon details immediately
            })
        } catch (err) {
            if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
                // unique constraint violation (bookingId + addonId already exists)
                throw new ConflictError("Addon already attached to this booking", "BOOKING_ADDON_EXISTS")
            }
            logger.error("BookingAddonRepository - Failed to create booking addon", { error: err.message })
            throw err
        }
    }

    async findByBookingId(bookingId) {
        return prisma.bookingAddon.findMany({
            where: { bookingId },
            include: { addon: true }
        })
    }

    async delete(bookingId, addonId) {
        return prisma.bookingAddon.delete({
            where: {
                bookingId_addonId: { bookingId, addonId }
            }
        })
    }
}
