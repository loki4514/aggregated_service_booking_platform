import crypto from "crypto";

// Generate idempotency key from booking details
export const createIdempotencyKey = (customerId, professionalId, serviceId, slotId, scheduledAt) => {
    const data = `${customerId}-${professionalId}-${serviceId}-${slotId}-${scheduledAt.toISOString()}`;
    return crypto.createHash("sha256").update(data).digest("hex");
};
