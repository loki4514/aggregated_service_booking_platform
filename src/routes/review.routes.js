import express from "express";
import { ReviewController } from "../controllers/review.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorizeRole } from "../middleware/authorizeRole.js";
import { validateBody } from "../middleware/validation.middleware.js";
import { createReviewSchema } from "../validators/review.validator.js";

const router = express.Router();
const reviewController = new ReviewController();

// Customer creates a review
router.post("/create-review", authMiddleware, validateBody(createReviewSchema), reviewController.createReview);

// Customer fetches their reviews
router.get("/me", authMiddleware, reviewController.getCustomerReviews);

// Public: fetch all reviews for a professional
router.get("/professional/:professionalId", authMiddleware, reviewController.getProfessionalReviews);

router.get("/my-reviews", authMiddleware, authorizeRole("PROFESSIONAL"), reviewController.getMyReviews)


export default router;
