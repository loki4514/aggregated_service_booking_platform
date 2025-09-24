
import logger from "../config/logger.js"
import { AddonRepository } from "../repository/addon.repository.js"

export class AddonService {
    constructor() {
        this.repo = new AddonRepository()
    }

    async getByService(serviceId) {
        const addons = await this.repo.findByService(serviceId)
        logger.info("AddonService - fetched addons by service", { serviceId })
        return addons
    }

    async getByProfessional(professionalId) {
        const addons = await this.repo.findByProfessional(professionalId)
        logger.info("AddonService - fetched addons by professional", { professionalId })
        return addons
    }
}
