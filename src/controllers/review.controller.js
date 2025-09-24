import { ProfessionalRepository } from "../repository/professional.repository.js";
import { ReviewService } from "../services/review.service.js";

export class ReviewController {
    constructor() {
        this.reviewService = new ReviewService();
        this.proRepo = new ProfessionalRepository()
    }

    createReview = async (req, res, next) => {
        try {
            const customerId = req.user.userId; // from auth
            const { bookingId, rating, comment } = req.body;

            const review = await this.reviewService.createReview(
                customerId,
                bookingId,
                rating,
                comment
            );

            res.status(201).json({ success: true, data: review });
        } catch (err) {
            next(err);
        }
    };

    getCustomerReviews = async (req, res, next) => {
        try {
            const customerId = req.user.userId;
            const { page = 1, limit = 10 } = req.query;

            const result = await this.reviewService.getCustomerReviews(
                customerId,
                parseInt(page, 10),
                parseInt(limit, 10)
            );

            res.json({ success: true, ...result });
        } catch (err) {
            next(err);
        }
    };

    getProfessionalReviews = async (req, res, next) => {
        try {
            const { professionalId } = req.params;
            const { page = 1, limit = 10 } = req.query;

            const result = await this.reviewService.getProfessionalReviews(
                professionalId,
                parseInt(page, 10),
                parseInt(limit, 10)
            );

            res.json({ success: true, ...result });
        } catch (err) {
            next(err);
        }
    };

    getMyReviews = async (req, res, next) => {
        try {
            const { userId } = req.user;
            const { page = 1, limit = 10 } = req.query;

            // Resolve professionalId from logged-in user
            const professional = await this.proRepo.findByUserId(userId);
            if (!professional) {
                return res.status(404).json({
                    success: false,
                    error: { code: "NOT_FOUND", message: "Professional not found" }
                });
            }

            const result = await this.reviewService.getProfessionalReviews(
                professional.id,
                parseInt(page, 10),
                parseInt(limit, 10)
            );

            res.json({ success: true, ...result });
        } catch (err) {
            next(err);
        }
    };

}
