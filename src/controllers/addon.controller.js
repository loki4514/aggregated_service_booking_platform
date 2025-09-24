import { AddonService } from "../services/addon.service.js"

export class AddonController {
    constructor() {
        this.service = new AddonService()
    }

    getByService = async (req, res, next) => {
        try {
            const data = await this.service.getByService(req.params.serviceId)
            res.json({ success: true, data })
        } catch (err) {
            next(err)
        }
    }

    getByProfessional = async (req, res, next) => {
        try {
            const data = await this.service.getByProfessional(req.params.professionalId)
            res.json({ success: true, data })
        } catch (err) {
            next(err)
        }
    }
}
