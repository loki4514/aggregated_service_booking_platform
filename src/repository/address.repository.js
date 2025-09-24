import { prisma } from "../config/database.js"
import logger from "../config/logger.js"

export class AddressRepository {
    async create(userId, data) {
        try {
            // if new address is marked as default → reset all others
            if (data.isDefault) {
                await prisma.address.updateMany({
                    where: { userId },
                    data: { isDefault: false }
                })
            }

            const address = await prisma.address.create({
                data: { ...data, userId }
            })
            logger.info("AddressRepository - Address created", { id: address.id, userId })
            return address
        } catch (err) {
            logger.error("AddressRepository - Failed to create address", { error: err.message })
            throw err
        }
    }

    async update(addressId, userId, data) {
        try {
            if (data?.isDefault) {
                await prisma.address.updateMany({
                    where: { userId, NOT: { id: addressId } },
                    data: { isDefault: false }
                })
            }

            const address = await prisma.address.update({
                where: { id: addressId },
                data
            })
            logger.info("AddressRepository - Address updated", { id: address.id, userId })
            return address
        } catch (err) {
            logger.error("AddressRepository - Failed to update address", { error: err.message })
            throw err
        }
    }

    async findById(id) {
        return prisma.address.findUnique({ where: { id } })
    }

    async findAllByUser(userId) {
        return prisma.address.findMany({ where: { userId } })
    }

    async delete(addressId) {
        try {
            const address = await prisma.address.delete({ where: { id: addressId } })
            logger.info("AddressRepository - Address deleted", { id: address.id })
            return address
        } catch (err) {
            logger.error("AddressRepository - Failed to delete address", { error: err.message })
            throw err
        }
    }
}