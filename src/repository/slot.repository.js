import { prisma } from "../config/database.js"
import logger from "../config/logger.js"

export class SlotRepository {
    async findById(slotId) {
        return prisma.slot.findUnique({ where: { id: slotId } })
    }

    async isAvailable(slotId, professionalId) {
        const slot = await prisma.slot.findFirst({
            where: {
                id: slotId,
                professionalId,
                state: "AVAILABLE"
            }
        })
        return slot
    }

    async markBooked(slotId) {
        try {
            const updated = await prisma.slot.update({
                where: { id: slotId },
                data: { state: "BOOKED" }
            })
            logger.info("SlotRepository - Slot booked", { slotId })
            return updated
        } catch (err) {
            logger.error("SlotRepository - Failed to mark slot booked", { error: err.message })
            throw err
        }
    }
}
