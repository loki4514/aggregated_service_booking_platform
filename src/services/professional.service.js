import logger from "../config/logger.js"
import { ProfessionalRepository } from "../repository/professional.repository.js"
import { ConflictError } from "../errors/customErrors.js"
import { UserService } from "./user.service.js"
import { ServiceRepository } from "../repository/service.repository.js"

export class ProfessionalService {
    constructor() {
        this.userService = new UserService()
        this.professionalRepo = new ProfessionalRepository()
        this.serviceRepo = new ServiceRepository()

    }

    async createProfessional(dto) {
        try {
            let user
            let token = null

            // 🔹 Check if user already exists
            const existingUser = await this.userService.findByEmail(dto.email)

            if (existingUser) {
                if (existingUser.role !== "PROFESSIONAL") {
                    user = await this.userService.updateUser(existingUser.id, { role: "PROFESSIONAL" })
                    logger.info("ProfessionalService - User upgraded to PROFESSIONAL", { id: user.id })
                } else {
                    throw new ConflictError("User is already a professional", "ALREADY_PROFESSIONAL")
                }
            } else {
                // 🔹 Create a new PROFESSIONAL user
                const result = await this.userService.createUser({
                    email: dto.email,
                    password: dto.password, // hashing inside UserService
                    phone: dto.phone,
                    firstName: dto.firstName,
                    lastName: dto.lastName,
                    role: "PROFESSIONAL",
                    pincode: dto.pincode
                })

                user = result.user
                token = result.token
                logger.info("ProfessionalService - New professional user created", { id: user.id })
            }

            // 🔹 Create Professional profile
            const professional = await this.professionalRepo.create(user.id, {
                businessName: dto.businessName,
                description: dto.description,
                experience: dto.experience,
                latitude: dto.latitude,
                longitude: dto.longitude,
                pincode: dto.pincode
            })

            return { token, professional }
        } catch (err) {
            logger.error("ProfessionalService - Failed to create professional", { error: err.message })
            throw err
        }
    }

    async getNearbyProfessionals(serviceId, address, page = 1, limit = 10) {
        if (!address.latitude || !address.longitude) {
            throw new NotFoundError("Address must have latitude & longitude", "INVALID_ADDRESS");
        }

        return this.professionalRepo.findNearbyByService(
            serviceId,
            address.latitude,
            address.longitude,
            25, // radius in km
            page,
            limit
        );
    }

    async getProfessionalsByService(serviceId, page = 1, limit = 10, slotsLimit = 5) {
        // Ensure service exists & is active (optional but nice)
        const svc = await this.serviceRepo.findById(serviceId);
        if (!svc) throw new NotFoundError("Service not found or inactive", "SERVICE_NOT_FOUND");

        const result = await this.professionalRepo.findByService(serviceId, page, limit, slotsLimit);
        
        if (!result.data.length) {
            throw new NotFoundError("No professionals found for this service", "NO_PROFESSIONALS");
        }

        return result;
    }


}
