import { prisma } from "../config/database.js"

export class ServiceRepository {
    async search(query, page = 1, limit = 10) {
        const [results, total] = await Promise.all([
            prisma.service.findMany({
                where: {
                    isActive: true,
                    OR: [
                        { name: { contains: query, mode: "insensitive" } },
                        { description: { contains: query, mode: "insensitive" } }
                    ]
                },
                include: { category: true },
                skip: (page - 1) * limit,
                take: limit
            }),
            prisma.service.count({
                where: {
                    isActive: true,
                    OR: [
                        { name: { contains: query, mode: "insensitive" } },
                        { description: { contains: query, mode: "insensitive" } }
                    ]
                }
            })
        ])

        return { results, total }
    }

    async findAll(page = 1, limit = 10) {
        const [results, total] = await Promise.all([
            prisma.service.findMany({
                where: { isActive: true },
                include: { category: true },
                skip: (page - 1) * limit,
                take: limit
            }),
            prisma.service.count({ where: { isActive: true } })
        ])

        return { results, total }
    }

    async findById(id) {
        return prisma.service.findFirst({
            where: { id, isActive: true },
            include: {
                category: true,
                Addon: true, // fetch related addons if needed
            }
        })
    }
}
