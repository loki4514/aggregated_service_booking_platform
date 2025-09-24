import { ServiceService } from "../services/service.service.js"

export class ServiceController {
    constructor() {
        this.serviceService = new ServiceService()
    }

    search = async (req, res) => {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10

        const { results, total } = await this.serviceService.search(req.query.q || "", page, limit)

        res.json({
            success: true,
            data: results,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        })
    }

    getAll = async (req, res) => {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10

        const { results, total } = await this.serviceService.getAll(page, limit)

        res.json({
            success: true,
            data: results,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        })
    }

    getById = async (req, res) => {
        const service = await this.serviceService.getById(req.params.id)
        res.json({ success: true, data: service })
    }

    getByService = async (req, res, next) => {
        try {
            const { serviceId } = req.params;
            const { page = 1, limit = 10, slotsLimit = 5 } = req.query;

            const result = await this.service.getProfessionalsByService(
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
}