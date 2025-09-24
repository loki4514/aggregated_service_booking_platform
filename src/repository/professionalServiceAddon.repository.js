import { prisma } from "../config/database.js"

export class ProfessionalServiceAddonRepository {
    async findByProfessionalAndAddon(professionalId, addonId) {
        return prisma.professionalServiceAddon.findUnique({
            where: { professionalId_addonId: { professionalId, addonId } },
            include: { addon: true }
        })
    }
}
