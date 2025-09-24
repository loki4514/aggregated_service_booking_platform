import { NotFoundError, ValidationError } from "../errors/customErrors.js"
import { AddressRepository } from "../repository/address.repository.js"
import { ProfessionalService } from "../services/professional.service.js"

export class ProfessionalController {
    constructor() {
        this.professionalService = new ProfessionalService()
        this.addressRepo = new AddressRepository()
    }

    createProfessional = async (req, res, next) => {
        try {
            const result = await this.professionalService.createProfessional(req.body)
            res.status(201).json({ success: true, data: result })
        } catch (err) {
            next(err)
        }
    }

    getByService = async (req, res, next) => {
        try {
            const { serviceId } = req.params;
            const { page = 1, limit = 10, slotsLimit = 5 } = req.query;

            const result = await this.professionalService.getProfessionalsByService(
                serviceId,
                parseInt(page, 10),
                parseInt(limit, 10),
                parseInt(slotsLimit, 10)
            );

            res.json({ success: true, ...result });
        } catch (err) {
            next(err);
        }
    };

    getNearby = async (req, res, next) => {
        try {
            const { serviceId, addressId } = req.query;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            if (!serviceId || !addressId) {
                throw new ValidationError("serviceId and addressId are required", "MISSING_PARAMS");
            }

            const address = await this.addressRepo.findById(addressId);
            if (!address) {
                throw new NotFoundError("Provided address not found", "ADDRESS_NOT_FOUND");
            }

            const pros = await this.professionalService.getNearbyProfessionals(
                serviceId,
                address,
                page,
                limit
            );

            res.json({
                success: true,
                data: pros,
                pagination: {
                    page,
                    limit,
                    count: pros.length
                }
            });
        } catch (err) {
            next(err);
        }
    };


}