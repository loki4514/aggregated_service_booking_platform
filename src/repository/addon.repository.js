import { prisma } from "../config/database.js"

export class AddonRepository {
    async findByService(serviceId) {
        return prisma.addon.findMany({
            where: { serviceId, isActive: true },
            include: {
                ProfessionalServiceAddon: {
                    include: { professional: true }
                }
            }
        })
    }

    async findByProfessional(professionalId) {
        return prisma.professionalServiceAddon.findMany({
            where: { professionalId, isOffered: true },
            include: { addon: true }
        })
    }

    
}
