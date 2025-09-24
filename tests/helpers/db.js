
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
    datasources: {
        db: {
            url:  process.env.BOOKING_DATABASE_URL
        }
    },
    log: process.env.NODE_ENV === 'test' ? [] : ['query', 'info', 'warn', 'error']
});

// Test utility functions
export const cleanupTestData = async () => {
    if (process.env.NODE_ENV === 'test') {
        try {
            // Delete in order to avoid foreign key constraints
            await prisma.booking.deleteMany({});
            await prisma.address.deleteMany({});
            await prisma.professional.deleteMany({});
            await prisma.user.deleteMany({});
        } catch (error) {
            console.warn('Cleanup warning:', error.message);
        }
    }
};

export default prisma;