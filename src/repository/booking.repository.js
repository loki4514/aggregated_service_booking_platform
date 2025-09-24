import { prisma } from "../config/database.js"
import logger from "../config/logger.js"
import { ConflictError } from "../errors/customErrors.js"


export class BookingRepository {
    async createBooking(data) {

        return prisma.$transaction(async (tx) => {
            // 1. Check idempotency
            const existing = await tx.booking.findUnique({
                where: { idempotencyKey: data.idempotencyKey }
            })
            if (existing) return existing

            // 2. Verify address belongs to user
            const address = await tx.address.findFirst({
                where: { id: data.addressId, userId: data.customerId }
            })
            if (!address) throw new Error("Invalid address for this customer")

            // 3. Lock slot (atomic update)
            const slot = await tx.slot.update({
                where: { id: data.slotId, state: "AVAILABLE" },
                data: { state: "BOOKED" }
            }).catch(() => null)

            if (!slot) throw new ConflictError("Slot not available or already booked", "SLOT_CONFLICT");

            // 4. Create booking
            const booking = await tx.booking.create({
                data: {
                    customerId: data.customerId,
                    professionalId: data.professionalId,
                    serviceId: data.serviceId,
                    scheduledAt: slot.startAt,
                    scheduledEndAt: slot.endAt,
                    addressId: data.addressId,
                    price: Number(parseFloat(data.totalPrice).toFixed(2)),
                    notes: data.notes,
                    idempotencyKey: data.idempotencyKey
                },
                include: {
                    service: true,
                    professional: { include: { user: { select: { firstName: true, lastName: true } } } },
                    address: true,
                    BookingAddon: { include: { addon: true } }
                }
            })

            // 5. Add addons
            if (data.addonIds?.length) {
                await Promise.all(
                    data.addonIds.map(addonId =>
                        tx.bookingAddon.upsert({
                            where: {
                                bookingId_addonId: {   // ✅ composite unique key
                                    bookingId: booking.id,
                                    addonId
                                }
                            },
                            update: {
                                quantity: { increment: 1 }  // ✅ increase if exists
                            },
                            create: {
                                bookingId: booking.id,
                                addonId,
                                quantity: 1
                            }
                        })
                    )
                )
            }


            logger.info("BookingRepository - Booking created", { bookingId: booking.id })
            return booking
        })
    }


    async findById(id) {
        return prisma.booking.findUnique({
            where: { id },
            include: {
                service: true,
                professional: { include: { user: true } },
                address: true,
                BookingAddon: { include: { addon: true } }
            }
        })
    }

    async findByIdempotencyKey(key) {
        return prisma.booking.findUnique({ where: { idempotencyKey: key } })
    }

    async findAllBookingsByProfessional(professionalId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;

        const [bookings, total] = await prisma.$transaction([
            prisma.booking.findMany({
                where: { professionalId },
                include: {
                    service: true,
                    customer: { select: { firstName: true, lastName: true } }
                },
                orderBy: [
                    { status: "asc" },        // ✅ pending first
                    { scheduledAt: "asc" }
                ],
                skip,
                take: limit
            }),
            prisma.booking.count({ where: { professionalId } })
        ]);

        return {
            data: bookings,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async findAllBookingsByCustomer(customerId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;

        const [bookings, total] = await prisma.$transaction([
            prisma.booking.findMany({
                where: { customerId },
                include: {
                    service: true,
                    professional: {
                        include: { user: { select: { firstName: true, lastName: true, email : true } } }
                    }
                },
                orderBy: [
                    { status: "asc" },        // ✅ pending first
                    { scheduledAt: "asc" }
                ],
                skip,
                take: limit
            }),
            prisma.booking.count({ where: { customerId } })
        ]);

        return {
            data: bookings,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    // Generic booking finder with filters + pagination
    async findBookings({ customerId, professionalId, statuses = [], page = 1, limit = 10 }) {
        const skip = (page - 1) * limit;

        const where = {
            ...(customerId ? { customerId } : {}),
            ...(professionalId ? { professionalId } : {}),
            ...(statuses.length > 0 ? { status: { in: statuses.map(s => s.toUpperCase()) } } : {})
        };

        const [bookings, total] = await prisma.$transaction([
            prisma.booking.findMany({
                where,
                include: {
                    service: {
                        select: { id: true, name: true, durationMinutes: true, basePrice: true }
                    },
                    professional: {
                        include: { user: { select: { firstName: true, lastName: true, email : true, phone : true } } }
                    },
                    customer: {
                        select: { firstName: true, lastName: true }
                    },
                    address: true
                },
                orderBy: [
                    { status: "asc" },        // PENDING first
                    { scheduledAt: "asc" }    // then by time
                ],
                skip,
                take: limit
            }),
            prisma.booking.count({ where })
        ]);

        return {
            data: bookings,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    // Update booking status and release/hold slot accordingly
    async updateBookingAndSlot(booking, newStatus, cancellationReason) {
        const normalizedStatus = newStatus.toUpperCase();

        return await prisma.$transaction(async (tx) => {
            // 1. Update booking
            const updatedBooking = await tx.booking.update({
                where: { id: booking.id },
                data: {
                    status: normalizedStatus,
                    cancellationReason: normalizedStatus === "CANCELLED" ? cancellationReason : null,
                    completedAt: normalizedStatus === "COMPLETED" ? new Date() : null,
                    updatedAt: new Date()
                },
                include: {
                    customer: {
                        select: { firstName: true, lastName: true, email: true, phone: true }
                    },
                    professional: {
                        select: { businessName: true }
                    },
                    service: {
                        select: { name: true, durationMinutes: true, basePrice: true }
                    },
                    address: true
                }
            });

            // 2. Update slot state (only if it exists)
            const slotState = this.getSlotStateForBookingStatus(normalizedStatus);

            await tx.slot.updateMany({
                where: {
                    professionalId: booking.professionalId,
                    startAt: booking.scheduledAt,
                    state: "BOOKED" // ✅ only touch booked slots
                },
                data: { state: slotState }
            });

            return updatedBooking;
        });
    }

    getSlotStateForBookingStatus(bookingStatus) {
        const statusToSlotState = {
            PENDING: "HELD",        // Slot is held but not confirmed
            CONFIRMED: "BOOKED",    // Slot is confirmed
            COMPLETED: "AVAILABLE", // Service done → free
            CANCELLED: "AVAILABLE", // Cancelled → free
            NO_SHOW: "AVAILABLE"    // No-show → free
        };
        return statusToSlotState[bookingStatus] || "AVAILABLE";
    }

}
