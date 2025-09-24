
import logger from "../config/logger.js"
import { ValidationError, NotFoundError, UnauthorizedError, ConflictError } from "../errors/customErrors.js"
import { generateToken } from "../utils/jwt.js"
import { UserRepository } from "../repository/user.repository.js"
import { AddressRepository } from "../repository/address.repository.js"
import { hashSecret } from "../utils/password.hash.js"


export class UserService {
    constructor() {
        this.userRepo = new UserRepository()
        this.addressRepo = new AddressRepository()
    }

    async findByPhone(phone) {
        return await this.userRepo.findByPhoneNumber(phone)
    }

    async findByEmail(email) {
        return await this.userRepo.findByEmail(email)
    }

    async createUser(dto) {
        try {
            // Validate required fields

            if (!dto.email || !dto.password) {
                throw new ValidationError("Email and password are required", "MISSING_REQUIRED_FIELDS")
            }

            // Check if user already exists
            const existingUser = await this.findByEmail(dto.email)
            if (existingUser) {
                throw new ConflictError("User with this email already exists", "USER_ALREADY_EXISTS")
            }

            if (dto.phone) {
                const existingPhone = await this.userRepo.findByPhoneNumber(dto.phone)
                if (existingPhone) {
                    throw new ConflictError("User with this phone number already exists", "PHONE_ALREADY_EXISTS")
                }
            }

            const hashed = await hashSecret(dto.password)
            const user = await this.userRepo.create({ ...dto, password: hashed })
            logger.info("UserService - User created", { id: user.id })
            let payload = { userId: user.id, role: dto.role, email: dto.email }
            let token = generateToken(payload)
            return { token, user }
        } catch (err) {
            logger.error("UserService - Failed to create user", { error: err.message })
            throw err
        }
    }

    async updateUser(userId, dto) {
        try {
            // Check if user exists
            const existingUser = await this.userRepo.findById(userId)
            if (!existingUser) {
                throw new NotFoundError("User not found", "USER_NOT_FOUND")
            }

            // Check for email conflicts if updating email
            if (dto.email && dto.email !== existingUser.email) {
                const emailConflict = await this.userRepo.findByEmail(dto.email)
                if (emailConflict) {
                    throw new ConflictError("Email is already in use", "EMAIL_ALREADY_EXISTS")
                }
            }

            // ✅ Check for phone conflicts if updating phone
            if (dto.phone && dto.phone !== existingUser.phone) {
                const phoneConflict = await this.userRepo.findByPhoneNumber(dto.phone)
                if (phoneConflict) {
                    throw new ConflictError("Phone number is already in use", "PHONE_ALREADY_EXISTS")
                }
            }

            // Hash password if being updated
            if (dto.password) {
                dto.password = await hashSecret(dto.password)
            }

            const user = await this.userRepo.update(userId, dto)
            logger.info("UserService - User updated", { id: user.id })
            return user
        } catch (err) {
            logger.error("UserService - Failed to update user", { error: err.message })
            throw err
        }
    }


    async createAddress(userId, dto) {
        try {
            // Validate user exists
            const user = await this.userRepo.findById(userId)
            if (!user) {
                throw new NotFoundError("User not found", "USER_NOT_FOUND")
            }

            const address = await this.addressRepo.create(userId, dto)
            logger.info("UserService - Address created", { id: address.id, userId })
            return address
        } catch (err) {
            logger.error("UserService - Failed to create address", { error: err.message })
            throw err
        }
    }

    async updateAddress(addressId, dto, userId) {
        try {
            const address = await this.addressRepo.findById(addressId)

            if (!address) {
                throw new NotFoundError("Address not found", "ADDRESS_NOT_FOUND")
            }

            if (address.userId !== userId) {
                logger.warn("UserService - Unauthorized address update attempt", {
                    addressId,
                    userId,
                })
                throw new UnauthorizedError("You can only update your own addresses", "UNAUTHORIZED_ADDRESS_ACCESS")
            }

            const updated = await this.addressRepo.update(addressId, userId, dto)
            logger.info("UserService - Address updated", { id: updated.id })
            return updated
        } catch (err) {
            logger.error("UserService - Failed to update address", { error: err.message })
            throw err
        }
    }

    async getUserWithAddresses(userId) {
        try {
            const user = await this.userRepo.findById(userId)
            if (!user) {
                throw new NotFoundError("User not found", "USER_NOT_FOUND")
            }

            const addresses = await this.addressRepo.findAllByUser(userId)
            return { ...user, addresses }
        } catch (err) {
            logger.error("UserService - Failed to get user with addresses", { error: err.message })
            throw err
        }
    }

    async deleteUser(userId) {
        try {
            const user = await this.userRepo.findById(userId)
            if (!user) {
                throw new NotFoundError("User not found", "USER_NOT_FOUND")
            }

            await this.userRepo.delete(userId)
            logger.info("UserService - User deleted", { id: userId })
            return { message: "User deleted successfully" }
        } catch (err) {
            logger.error("UserService - Failed to delete user", { error: err.message })
            throw err
        }
    }

    async deleteAddress(addressId) {
        try {
            const address = await this.addressRepo.delete(addressId);

            if (!address) {
                throw new NotFoundError("Address not found", "ADDRESS_NOT_FOUND");
            }

            logger.info("AddressService - Address deleted", { id: addressId });
            return { message: "Address deleted successfully" };
        } catch (err) {
            logger.error("AddressService - Failed to delete address", { error: err.message });
            throw err;
        }
    }

}