import { ReviewRepository } from "../repository/review.repository.js";
import { BookingRepository } from "../repository/booking.repository.js";
import { NotFoundError, ForbiddenError } from "../errors/customErrors.js";

export class ReviewService {
    constructor() {
        this.reviewRepo = new ReviewRepository();
        this.bookingRepo = new BookingRepository();
    }

    async createReview(customerId, bookingId, rating, comment) {
        const booking = await this.bookingRepo.findById(bookingId);
        if (!booking) {
            throw new NotFoundError("Booking not found", "BOOKING_NOT_FOUND");
        }

        // Ownership check
        if (booking.customerId !== customerId) {
            throw new ForbiddenError(
                "You can only review your own bookings",
                "BOOKING_NOT_OWNED"
            );
        }

        // Ensure booking is completed
        if (booking.status !== "COMPLETED") {
            throw new ForbiddenError(
                "You can only review completed bookings",
                "BOOKING_NOT_COMPLETED"
            );
        }

        return this.reviewRepo.create({
            bookingId,
            customerId,
            professionalId: booking.professionalId,
            rating,
            comment
        });
    }

    async getCustomerReviews(customerId, page, limit) {
        return this.reviewRepo.findByCustomer(customerId, page, limit);
    }

    async getProfessionalReviews(professionalId, page, limit) {
        return this.reviewRepo.findByProfessional(professionalId, page, limit);
    }
}
