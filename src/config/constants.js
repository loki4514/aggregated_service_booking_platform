// Helper to ensure env variables exist
import dotenv from "dotenv";
dotenv.config();

function getEnvVar(key) {
    if (!process.env[key]) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return process.env[key];
}

// Export constants
export const PORT = getEnvVar("BOOKING_PLATFORM_PORT");
export const LOG_LEVEL = getEnvVar("BOOKING_PLATFORM_LOG_LEVEL");
export const NODE_ENV  = getEnvVar("BOOKING_PLATFORM_NODE_ENV").toLowerCase()
export const SALT_ROUNDS = getEnvVar("BOOKING_PLATFORM_SALT_ROUNDS")
export const JWT_SECRET = getEnvVar("BOOKING_PLATFORM_JWT_SECRET")
export const JWT_EXPIRES_IN = getEnvVar("BOOKING_PLATFORM_JWT_EXPIRES_IN")
