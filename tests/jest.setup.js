// tests/setup.js
import dotenv from 'dotenv';

// Load test environment variables first
dotenv.config({ path: '.env.test' });

// Fix the typo and set consistent environment variables
process.env.NODE_ENV = 'test';
process.env.BOOKING_PLATFORM_NODE_ENV = 'test'; // Fixed the typo from BOOKING_PLATFROM_NODE_ENV
process.env.BOOKING_PLATFORM_JWT_SECRET = process.env.BOOKING_PLATFORM_JWT_SECRET || '7798de9851b4f4254703f9fa1f1feb2b8f3d070d204b8e1fe60c421e1fefe008';
process.env.BOOKING_PLATFORM_JWT_EXPIRES_IN = process.env.BOOKING_PLATFORM_JWT_EXPIRES_IN || '1d';
process.env.BOOKING_PLATFORM_SALT_ROUNDS = process.env.BOOKING_PLATFORM_SALT_ROUNDS || '10';
process.env.BOOKING_PLATFORM_LOG_LEVEL = process.env.BOOKING_PLATFORM_LOG_LEVEL || 'ERROR'; // Reduce log noise in tests

// Global test timeout
jest.setTimeout(30000);

// Suppress console output during tests (optional)
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleLog = console.log;

beforeEach(() => {
    // Suppress console output during tests to reduce noise
    console.error = jest.fn();
    console.warn = jest.fn();
    // console.log = jest.fn();
});

afterEach(() => {
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
    console.log = originalConsoleLog;
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Custom Jest matchers
expect.extend({
    toBeValidUUID(received) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        const pass = uuidRegex.test(received);
        
        if (pass) {
            return {
                message: () => `expected ${received} not to be a valid UUID`,
                pass: true,
            };
        } else {
            return {
                message: () => `expected ${received} to be a valid UUID`,
                pass: false,
            };
        }
    },
});