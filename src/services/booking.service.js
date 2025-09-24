import { BookingRepository } from "../repository/booking.repository.js"
import { SlotRepository } from "../repository/slot.repository.js"
import { PriceService } from "./price.service.js"
import { ConflictError, ValidationError, NotFoundError, ForbiddenError } from "../errors/customErrors.js"
import { AddressRepository } from "../repository/address.repository.js"
import { createIdempotencyKey } from "../utils/idempotentKey.js"
import { ProfessionalRepository } from "../repository/professional.repository.js"

export class BookingService {
    constructor() {
        this.bookingRepo = new BookingRepository()
        this.slotRepo = new SlotRepository()
        this.priceService = new PriceService()
        this.addressRepo = new AddressRepository()
        this.proRepo = new ProfessionalRepository()

    }

    // booking.service.js
    async getBookingsForProfessional(userId, statuses = [], page = 1, limit = 10) {
        const professional = await this.proRepo.findByUserId(userId);
        if (!professional) {
            throw new NotFoundError("Professional not found", "PROFESSIONAL_NOT_FOUND");
        }

        // normalize statuses → always uppercase
        const normalizedStatuses = statuses.map(s => s.toUpperCase());

        return this.bookingRepo.findBookings({
            professionalId: professional.id,
            statuses: normalizedStatuses,
            page,
            limit
        });
    }

    async getBookingsForCustomer(userId, statuses = [], page = 1, limit = 10) {
        // normalize statuses → always uppercase
        const normalizedStatuses = statuses.map(s => s.toUpperCase());

        return this.bookingRepo.findBookings({
            customerId: userId,
            statuses: normalizedStatuses,
            page,
            limit
        });
    }




    async createBooking({ customerId, professionalId, serviceId, slotId, addressId, addonIds = [], notes }) {
        // 1️ Check address
        const address = await this.addressRepo.findById(addressId)
        if (!address) {
            throw new NotFoundError("Address not found", "ADDRESS_NOT_FOUND")
        }
        if (address.userId !== customerId) {
            throw new ForbiddenError("You cannot use another user's address", "FORBIDDEN_ADDRESS")
        }

        // 2️ Slot check
        const slotData = await this.slotRepo.isAvailable(slotId, professionalId)
        if (!slotData) {
            throw new NotFoundError("Slot not found or unavailable", "SLOT_NOT_FOUND")
        }

        // 3️ Idempotency
        const idempotencyKey = createIdempotencyKey(customerId, professionalId, serviceId, slotId, slotData.startAt)
        const existing = await this.bookingRepo.findByIdempotencyKey(idempotencyKey)

        if (existing) {
            // only allow returning if still PENDING or CONFIRMED
            if (["PENDING", "CONFIRMED"].includes(existing.status)) {
                return existing
            }
            throw new ConflictError(`Booking already exists with status ${existing.status}`, "BOOKING_ALREADY_PROCESSED")
        }

        // 4️ Price calculation
        const price = await this.priceService.estimatePrice({ professionalId, serviceId, addonIds })

        let totalPrice = price.totalPrice



        // 5️ Create booking
        const booking = await this.bookingRepo.createBooking({
            customerId,
            professionalId,
            serviceId,
            slotId,
            addressId,
            totalPrice,
            notes,
            idempotencyKey,
            addonIds

        })

        // 6️ Ensure only return if still pending/confirmed
        if (["PENDING", "CONFIRMED"].includes(booking.status)) {
            return booking
        }

        throw new ConflictError(`Booking created but invalid status: ${booking.status}`, "INVALID_BOOKING_STATUS")
    }

    async updateBookingStatusByProfessional(bookingId, professionalUserId, newStatus, cancellationReason) {
        // Get professional
        const professional = await this.proRepo.findByUserId(professionalUserId)
        if (!professional) {
            throw new NotFoundError("Professional not found", "PROFESSIONAL_NOT_FOUND")
        }

        // Get booking
        const booking = await this.bookingRepo.findById(bookingId)
        if (!booking) {
            throw new NotFoundError("Booking not found", "BOOKING_NOT_FOUND")
        }

        // Verify ownership
        if (booking.professionalId !== professional.id) {
            throw new ForbiddenError("You can only update your own bookings", "BOOKING_NOT_OWNED")
        }

        // Validate status transitions for professionals
        const validTransitions = {
            'PENDING': ['CONFIRMED', 'CANCELLED'],
            'CONFIRMED': ['COMPLETED', 'CANCELLED']
        }

        if (!validTransitions[booking.status]?.includes(newStatus)) {
            throw new ValidationError(
                `Cannot change booking from ${booking.status} to ${newStatus}`,
                "INVALID_STATUS_TRANSITION"
            )
        }

        // Update booking and slot state
        return await this.bookingRepo.updateBookingAndSlot(booking, newStatus, cancellationReason)
    }

    async cancelBookingByCustomer(bookingId, customerId, cancellationReason) {
        // Get booking
        const booking = await this.bookingRepo.findById(bookingId)
        if (!booking) {
            throw new NotFoundError("Booking not found", "BOOKING_NOT_FOUND")
        }

        // Verify ownership
        if (booking.customerId !== customerId) {
            throw new ForbiddenError("You can only cancel your own bookings", "BOOKING_NOT_OWNED")
        }

        // Validate status transitions for customers
        const allowedStatuses = ['PENDING', 'CONFIRMED']
        if (!allowedStatuses.includes(booking.status)) {
            throw new ValidationError(
                `Cannot cancel booking with status ${booking.status}`,
                "CANNOT_CANCEL_BOOKING"
            )
        }

        // Check cancellation policy (24 hours before)
        const hoursUntilBooking = (new Date(booking.scheduledAt) - new Date()) / (1000 * 60 * 60)
        if (hoursUntilBooking < 3) {
            throw new ValidationError(
                "Cannot cancel booking less than 3 hours in advance",
                "CANCELLATION_TOO_LATE"
            )
        }

        // Update booking and slot state
        return await this.bookingRepo.updateBookingAndSlot(booking, 'CANCELLED', cancellationReason)
    }

}
