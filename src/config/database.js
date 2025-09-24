// prisma.ts
import { PrismaClient } from '@prisma/client';
import { NODE_ENV } from './constants.js';

export const prisma = new PrismaClient({
    log: NODE_ENV === 'development'
        ? ['info', 'warn', 'error']
        : ['error'],
    errorFormat: 'minimal',
});

// Graceful shutdown
process.on('beforeExit', async () => {
    await prisma.$disconnect();
});
