import { prisma } from "../config/database.js"
import logger from "../config/logger.js"

export class ProfessionalRepository {
    async create(userId, data) {
        try {
            const professional = await prisma.professional.create({
                data: {
                    ...data,
                    userId
                }
            })
            logger.info("ProfessionalRepository - Professional created", { id: professional.id })
            return professional
        } catch (err) {
            logger.error("ProfessionalRepository - Failed to create professional", { error: err.message })
            throw err
        }
    }

    async findByUserId(userId) {
        return prisma.professional.findUnique({ where: { userId } })
    }

    async findById(id) {
        return prisma.professional.findUnique({ where: { id } })
    }

    async update(id, data) {
        return prisma.professional.update({ where: { id }, data })
    }

    async findNearbyByService(serviceId, lat, lng, radiusKm = 10, page = 1, limit = 10, slotsLimit = 3) {
        const skip = (page - 1) * limit;

        const pros = await prisma.professional.findMany({
            where: {
                isAvailable: true,
                professionalServices: {
                    some: { serviceId, isOffered: true }
                }
            },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        phone: true,
                        email: true
                    }
                },
                Slot: {
                    where: { state: "AVAILABLE" },
                    orderBy: { startAt: "asc" },
                    take: slotsLimit   // ✅ limit slots per professional
                }
            },
            skip,
            take: limit
        });

        const EARTH_RADIUS = 6371;
        function haversine(lat1, lon1, lat2, lon2) {
            const toRad = (x) => (x * Math.PI) / 180;
            const dLat = toRad(lat2 - lat1);
            const dLon = toRad(lon2 - lon1);
            const a =
                Math.sin(dLat / 2) ** 2 +
                Math.cos(toRad(lat1)) *
                Math.cos(toRad(lat2)) *
                Math.sin(dLon / 2) ** 2;
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return EARTH_RADIUS * c;
        }

        const filtered = pros.filter(
            (pro) =>
                pro.latitude &&
                pro.longitude &&
                haversine(lat, lng, pro.latitude, pro.longitude) <= radiusKm
        );

        return filtered.map((pro) => ({
            id: pro.id,
            name: `${pro.user.firstName} ${pro.user.lastName}`,
            phone: pro.user.phone,
            email: pro.user.email,
            distanceKm: haversine(lat, lng, pro.latitude, pro.longitude).toFixed(2),
            slots: pro.Slot   // ✅ return the limited slots array directly
        }));
    }

    async findByService(serviceId, page = 1, limit = 10, slotsLimit = 5) {
        const skip = (page - 1) * limit;

        const where = {
            isAvailable: true,
            professionalServices: {
                some: { serviceId, isOffered: true }
            }
        };

        const [pros, total] = await prisma.$transaction([
            prisma.professional.findMany({
                where,
                include: {
                    user: {
                        select: { firstName: true, lastName: true, email: true, phone: true }
                    },
                    Slot: {
                        where: { state: "AVAILABLE" },
                        orderBy: { startAt: "asc" },
                        take: slotsLimit
                    }
                },
                skip,
                take: limit
            }),
            prisma.professional.count({ where })
        ]);

        return {
            data: pros.map(pro => ({
                id: pro.id,
                name: `${pro.user.firstName} ${pro.user.lastName}`,
                businessName: pro.businessName,
                email: pro.user.email,
                phone: pro.user.phone,
                rating: pro.rating,
                slots: pro.Slot
            })),
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
        };

    }


}