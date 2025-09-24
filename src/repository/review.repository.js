import { prisma } from "../config/database.js";
import { ConflictError } from "../errors/customErrors.js";

export class ReviewRepository {
    async create(data) {
        try {
            return await prisma.review.create({
                data,
                include: {
                    booking: true,
                    customer: { select: { firstName: true, lastName: true } },
                    professional: { select: { id: true, businessName: true } }
                }
            });
        } catch (err) {
            if (err.code === "P2002" && err.meta?.target?.includes("bookingId")) {
                throw new ConflictError(
                    "A review already exists for this booking",
                    "REVIEW_ALREADY_EXISTS"
                );
            }
            throw err;
        }
    }


    async findByBookingId(bookingId) {
        return prisma.review.findUnique({
            where: { bookingId },
            include: {
                customer: { select: { firstName: true, lastName: true } },
                professional: { select: { id: true, businessName: true } }
            }
        });
    }

    async findByCustomer(customerId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;

        const [reviews, total] = await prisma.$transaction([
            prisma.review.findMany({
                where: { customerId },
                include: {
                    booking: true,
                    professional: { select: { id: true, businessName: true } }
                },
                skip,
                take: limit,
                orderBy: { createdAt: "desc" }
            }),
            prisma.review.count({ where: { customerId } })
        ]);

        return {
            data: reviews,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async findByProfessional(professionalId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;

        const [reviews, total] = await prisma.$transaction([
            prisma.review.findMany({
                where: { professionalId },
                include: {
                    booking: true,
                    customer: { select: { firstName: true, lastName: true } }
                },
                skip,
                take: limit,
                orderBy: { createdAt: "desc" }
            }),
            prisma.review.count({ where: { professionalId } })
        ]);

        return {
            data: reviews,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
}
