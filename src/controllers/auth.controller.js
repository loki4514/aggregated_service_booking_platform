

import { AuthService } from "../services/auth.service.js"

export class AuthController {
    constructor() {
        this.authService = new AuthService()
    }

    login = async (req, res, next) => {
        try {
            const { email, password } = req.body
            const result = await this.authService.login({ email, password })
            res.json({ success: true, token : result })
        } catch (err) {
            next(err)
        }
    }
}