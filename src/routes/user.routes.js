import express from "express"
import { UserController } from "../controllers/user.controller.js"
import { validateBody, validateParams } from "../middleware/validation.middleware.js"
import {
    signupSchema,
    updateUserSchema,
    addressSchema,
    updateAddressSchema,
    userIdSchema,
    addressIdSchema,

} from "../validators/user.validator.js"
import Joi from "joi"
import { authMiddleware } from "../middleware/auth.middleware.js"
import { checkUserOwnership } from "../middleware/checkUserOwnership.js"

const router = express.Router()
const userController = new UserController()

// User routes
router.post(
    "/signup",
    validateBody(signupSchema),
    userController.createUser
)

router.get(
    "/:userId",
    authMiddleware,
    validateParams(userIdSchema),
    userController.getUserProfile
)

router.patch(
    "/update-user",
    authMiddleware,                                
    validateBody(updateUserSchema),                
    userController.updateUser             
)


// router.delete(
//     "/:userId", 
//     validateParams(userIdSchema), 
//     userController.deleteUser
// )

// Address routes
router.put(
    "/addresses",
    authMiddleware,
    validateBody(addressSchema),
    userController.createAddress
)

router.patch(
    "/addresses/:addressId",
    authMiddleware,
    validateParams(Joi.object({
        addressId: Joi.string().uuid().required()
    })),
    validateBody(updateAddressSchema),
    userController.updateAddress
)



router.delete(
    "/addresses/:addressId", 
    authMiddleware,
    validateParams(Joi.object({
        addressId: Joi.string().uuid().required()
    })), 
    userController.deleteAddress
)

export default router