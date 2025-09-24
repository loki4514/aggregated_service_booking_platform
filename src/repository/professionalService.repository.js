import { prisma } from "../config/database.js"

export class ProfessionalServiceRepository {
    async findByProfessionalAndService(professionalId, serviceId) {
        return prisma.professionalService.findUnique({
            where: { professionalId_serviceId: { professionalId, serviceId } },
            include: { service: true }
        })
    }
}
