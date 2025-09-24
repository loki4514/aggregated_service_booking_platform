import { ProfessionalServiceRepository } from "../repository/professionalService.repository.js"
import { ProfessionalServiceAddonRepository } from "../repository/professionalServiceAddon.repository.js"
import logger from "../config/logger.js"


export class PriceService {
    constructor() {
        this.proServiceRepo = new ProfessionalServiceRepository()
        this.proAddonRepo = new ProfessionalServiceAddonRepository()
    }

    async estimatePrice({ professionalId, serviceId, addonIds = [] }) {
        let totalPrice = 0

        // 1️⃣ Base service price
        const proService = await this.proServiceRepo.findByProfessionalAndService(professionalId, serviceId)
        if (!proService) throw new Error("Professional does not offer this service")

        const basePrice = proService.customPrice ?? proService.service.basePrice
        totalPrice += basePrice

        const serviceDetails = {
            id: proService.service.id,
            name: proService.service.name,
            description: proService.service.description,
            durationMinutes: proService.service.durationMinutes,
            basePrice: Number(proService.service.basePrice.toFixed(2)),
            customPrice: proService.customPrice ? Number(proService.customPrice.toFixed(2)) : null,
            appliedPrice: Number(basePrice.toFixed(2))
        }

        // 2️⃣ Addons
        const addonDetails = []
        for (const addonId of addonIds) {
            const proAddon = await this.proAddonRepo.findByProfessionalAndAddon(professionalId, addonId)
            if (!proAddon) throw new Error(`Professional does not offer addon ${addonId}`)

            const addonPrice = proAddon.customPrice ?? proAddon.addon.basePrice
            totalPrice += addonPrice

            addonDetails.push({
                id: proAddon.addon.id,
                name: proAddon.addon.name,
                description: proAddon.addon.description,
                basePrice: Number(proAddon.addon.basePrice.toFixed(2)),
                customPrice: proAddon.customPrice ? Number(proAddon.customPrice.toFixed(2)) : null,
                appliedPrice: Number(addonPrice.toFixed(2))
            })
        }

        const result = {
            service: serviceDetails,
            addons: addonDetails,
            totalPrice: Number(totalPrice.toFixed(2)) // ✅ final total
        }

        logger.info("PriceService - Estimated price", { serviceId, professionalId, totalPrice: result.totalPrice })
        return result
    }
}
