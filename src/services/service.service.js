
import { NotFoundError } from "../errors/customErrors.js"
import { ServiceRepository } from "../repository/service.repository.js"

export class ServiceService {
    constructor() {
        this.repo = new ServiceRepository()
    }

    async search(query, page, limit) {
        return this.repo.search(query, page, limit)
    }

    async getAll(page, limit) {
        return this.repo.findAll(page, limit)
    }

    async getById(id) {
        const service = await this.repo.findById(id)
        if (!service) {
            throw new NotFoundError("Service not found or inactive", "SERVICE_NOT_FOUND")
        }
        return service
    }
}
