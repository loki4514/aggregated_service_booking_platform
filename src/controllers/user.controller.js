
import { UserService } from "../services/user.service.js"
import logger from "../config/logger.js"

export class UserController {
    constructor() {
        this.userService = new UserService()
    }

    // Create user (signup)
    createUser = async (req, res, next) => {
        try {
            const {token, user} = await this.userService.createUser(req.body)
            // Remove password from response
            

            logger.info("Controller - User created successfully", { userId: user.id })
            const { password, ...userWithoutPassword } = user;

            res.status(201).json({
                success: true,
                message: "User created successfully",
                data : userWithoutPassword,
                token : token
            })
        } catch (error) {
            next(error)
        }
    }

    // Get user profile
    getUserProfile = async (req, res, next) => {
        try {
            const { userId } = req.params
            const user = await this.userService.getUserWithAddresses(userId)

            // Remove password from response
            const { password, ...userResponse } = user

            res.status(200).json({
                success: true,
                data: userResponse
            })
        } catch (error) {
            next(error)
        }
    }

    // Update user
    updateUser = async (req, res, next) => {
        try {
            const userId = req.user.userId
            const user = await this.userService.updateUser(userId, req.body)

            // Remove password from response
            const { password, ...userResponse } = user

            logger.info("Controller - User updated successfully", { userId })

            res.status(200).json({
                success: true,
                message: "User updated successfully",
                data: userResponse
            })
        } catch (error) {
            next(error)
        }
    }

    // Delete user
    deleteUser = async (req, res, next) => {
        try {
            const { userId } = req.params
            const result = await this.userService.deleteUser(userId)

            logger.info("Controller - User deleted successfully", { userId })

            res.status(200).json({
                success: true,
                message: result.message
            })
        } catch (error) {
            next(error)
        }
    }

    // Create address
    createAddress = async (req, res, next) => {
        try {
            const userId = req.user.userId
            const address = await this.userService.createAddress(userId, req.body)

            logger.info("Controller - Address created successfully", {
                addressId: address.id,
                userId
            })

            res.status(201).json({
                success: true,
                message: "Address created successfully",
                data: address
            })
        } catch (error) {
            next(error)
        }
    }

    // Update address
    updateAddress = async (req, res, next) => {
        try {
            const { addressId } = req.params
            const userId = req.user.userId// Assuming you have auth middleware

            const address = await this.userService.updateAddress(addressId, req.body, userId)

            logger.info("Controller - Address updated successfully", {
                addressId,
                userId
            })

            res.status(200).json({
                success: true,
                message: "Address updated successfully",
                data: address
            })
        } catch (error) {
            next(error)
        }
    }

    // Delete address (bonus method)
    deleteAddress = async (req, res, next) => {
        try {
            const { addressId } = req.params
            const userId = req.user.userId

            await this.userService.deleteAddress(addressId, userId)

            logger.info("Controller - Address deleted successfully", {
                addressId,
                userId
            })

            res.status(200).json({
                success: true,
                message: "Address deleted successfully"
            })
        } catch (error) {
            next(error)
        }
    }
}