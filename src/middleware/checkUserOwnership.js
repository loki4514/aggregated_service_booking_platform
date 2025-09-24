import { ForbiddenError } from "../errors/customErrors.js"



export function checkUserOwnership(req, res, next) {
    const loggedInUser = req.user
    const targetUserId = req.params.userId

   

    if (loggedInUser.userId === targetUserId) {
        return next()
    }

    console.log("forbidden update")
    return next(new ForbiddenError("You are not allowed to modify this user", "FORBIDDEN_UPDATE"))
}
