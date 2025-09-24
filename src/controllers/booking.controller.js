import { BookingService } from "../services/booking.service.js"
import { PriceService } from "../services/price.service.js"
import { statusQuerySchema } from "../validators/booking.validator.js"

export class BookingController {
    constructor() {
        this.priceService = new PriceService()
        this.bookingService = new BookingService()
    }

    estimatePrice = async (req, res, next) => {
        try {
            const { professionalId, serviceId, addonIds } = req.body
            const price = await this.priceService.estimatePrice({ professionalId, serviceId, addonIds })
            res.json({ success: true, data: { price } })
        } catch (err) {
            next(err)
        }
    }

    createBooking = async (req, res, next) => {
        try {
            const customerId = req.user.userId // 👈 from authMiddleware

            const { professionalId, serviceId, slotId, addressId, addonIds, notes } = req.body

            const booking = await this.bookingService.createBooking({
                customerId,
                professionalId,
                serviceId,
                slotId,
                addressId,
                addonIds,
                notes
            })

            res.status(201).json({ success: true, data: booking })
        } catch (err) {
            next(err)
        }
    }

    getBookingById = async (req, res, next) => {
        try {
            const booking = await this.bookingService.bookingRepo.findById(req.params.id)
            if (!booking) {
                return res
                    .status(404)
                    .json({ success: false, error: { code: "NOT_FOUND", message: "Booking not found" } })
            }
            res.json({ success: true, data: booking })
        } catch (err) {
            next(err)
        }
    }

    getBookingsForProfessional = async (req, res, next) => {
        try {

            const { value, error } = statusQuerySchema.validate(req.query, { convert: true });
            if (error) {
                return res.status(400).json({
                    success: false,
                    error: { code: "VALIDATION_ERROR", message: error.details[0].message },
                });
            }
            const userId = req.user.userId
            const { status, page = 1, limit = 10 } = req.query


            const result = await this.bookingService.getBookingsForProfessional(
                userId,
                status ? [status] : [],
                parseInt(page, 10),
                parseInt(limit, 10)
            )

            res.json({ success: true, ...result })
        } catch (err) {
            next(err)
        }
    }

    // 🔹 Customer: fetch bookings (optionally filter by status)
    getBookingsForCustomer = async (req, res, next) => {
        try {
            const { value, error } = statusQuerySchema.validate(req.query, { convert: true });
            if (error) {
                return res.status(400).json({
                    success: false,
                    error: { code: "VALIDATION_ERROR", message: error.details[0].message },
                });
            }
            const userId = req.user.userId
            const { status, page = 1, limit = 10 } = req.query

            const result = await this.bookingService.getBookingsForCustomer(
                userId,
                status ? [status] : [],
                parseInt(page, 10),
                parseInt(limit, 10)
            )

            res.json({ success: true, ...result })
        } catch (err) {
            next(err)
        }
    }

    updateBookingStatus = async (req, res, next) => {
        try {
            const { id } = req.params;
            const { status, cancellationReason } = req.body;
            const { userId } = req.user; // 👈 professional’s userId from auth


            const booking = await this.bookingService.updateBookingStatusByProfessional(
                id,
                userId, // pass userId, service will resolve professionalId
                status,
                cancellationReason
            );

            res.json({ success: true, data: booking });
        } catch (err) {
            next(err);
        }
    };


    cancelBooking = async (req, res, next) => {
        try {
            const { id } = req.params;
            const { cancellationReason } = req.body;
            const { userId } = req.user; // 👈 customer’s userId from auth

            const booking = await this.bookingService.cancelBookingByCustomer(
                id,
                userId,
                cancellationReason
            );

            res.json({ success: true, data: booking });
        } catch (err) {
            next(err);
        }
    };
}
