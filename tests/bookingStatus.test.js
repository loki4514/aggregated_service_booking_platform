import request from "supertest";
import app from "../app.js";
import prisma from "./helpers/db.js";
import jwt from "jsonwebtoken";

let customerToken, professionalToken;
let customerId, professionalId;
let pendingBookingId, confirmedBookingId;

beforeAll(async () => {
    await prisma.$connect();

    // 🔐 Login customer (Arjun)
    const customerLogin = await request(app)
        .post("/api/v1/auth/login")
        .send({
            email: "arjun.sharma@email.com",
            password: "password123",
        })
        .expect(200);
    customerToken = customerLogin.body.data?.token || customerLogin.body.token;
    customerId = jwt.decode(customerToken).userId;

    // 🔐 Login professional (Kavya Beauty)
    const professionalLogin = await request(app)
        .post("/api/v1/auth/login")
        .send({
            email: "kavya.beauty@email.com", // Professional email
            password: "password123",
        })
        .expect(200);
    professionalToken = professionalLogin.body.data?.token || professionalLogin.body.token;
    professionalId = jwt.decode(professionalToken).userId;

    // 📋 Fetch professional's existing pending bookings (not customer's)
    const professionalPendingResp = await request(app)
        .get("/api/v1/bookings/professional-bookings?status=pending")
        .set("Authorization", `Bearer ${professionalToken}`)
        .expect(200);

    console.log(`Found ${professionalPendingResp.body.data.length} pending professional bookings`);
    
    if (professionalPendingResp.body.data.length > 0) {
        pendingBookingId = professionalPendingResp.body.data[0].id;
        console.log(`Using pending booking: ${pendingBookingId}`);
    }

    // 📋 Fetch professional's existing bookings
    const professionalBookingsResp = await request(app)
        .get("/api/v1/bookings/professional-bookings?status=confirmed")
        .set("Authorization", `Bearer ${professionalToken}`)
        .expect(200);

    console.log(`Found ${professionalBookingsResp.body.data.length} confirmed professional bookings`);
    
    if (professionalBookingsResp.body.data.length > 0) {
        confirmedBookingId = professionalBookingsResp.body.data[0].id;
        console.log(`Using confirmed booking: ${confirmedBookingId}`);
    }
});

afterAll(async () => {
    await prisma.$disconnect();
});
describe("Booking Status Management", () => {
    
    describe("Professional Status Updates", () => {
        
        it("should allow professional to confirm PENDING booking", async () => {
            // Get professional's own pending bookings
            const professionalBookingsResp = await request(app)
                .get("/api/v1/bookings/professional-bookings?status=pending")
                .set("Authorization", `Bearer ${professionalToken}`)
                .expect(200);

            if (professionalBookingsResp.body.data.length === 0) {
                console.log("Skipping test - no pending professional bookings available");
                return;
            }

            const pendingBooking = professionalBookingsResp.body.data[0];
            const decodedToken = jwt.decode(professionalToken);
            
            console.log(`Testing with pending booking: ${pendingBooking.id}`);
            console.log(`Booking professional ID: ${pendingBooking.professionalId}`);
            console.log(`Token user ID: ${decodedToken.userId}`);
            console.log(`Token role: ${decodedToken.role}`);
            console.log(`Request URL: PATCH /api/v1/bookings/${pendingBooking.id}/status`);

            // Don't expect 200 initially - let's see what we actually get
            const response = await request(app)
                .patch(`/api/v1/bookings/${pendingBooking.id}/status`)
                .set("Authorization", `Bearer ${professionalToken}`)
                .send({
                    status: "CONFIRMED"
                });

            console.log(`Response Status: ${response.status}`);
            console.log(`Response Body:`, response.body);

            // Now assert based on what we actually receive
            if (response.status === 200) {
                expect(response.body.success).toBe(true);
                expect(response.body.data.status).toBe("CONFIRMED");
                console.log(`Successfully confirmed booking ${pendingBooking.id}`);
            } else {
                // Log the error for debugging
                console.error(`Failed to confirm booking. Status: ${response.status}`);
                console.error(`Error:`, response.body);
                
                // You can choose to fail the test or investigate further
                throw new Error(`Expected status 200, got ${response.status}: ${response.body?.error?.message || 'Unknown error'}`);
            }
        });

        it("should allow professional to complete CONFIRMED booking", async () => {
            // Get a confirmed booking from professional's bookings
            const professionalBookingsResp = await request(app)
                .get("/api/v1/bookings/professional-bookings?status=confirmed")
                .set("Authorization", `Bearer ${professionalToken}`)
                .expect(200);

            if (professionalBookingsResp.body.data.length === 0) {
                console.log("Skipping test - no confirmed bookings available");
                return;
            }

            const confirmedBooking = professionalBookingsResp.body.data[0];
            
            const response = await request(app)
                .patch(`/api/v1/bookings/${confirmedBooking.id}/status`)
                .set("Authorization", `Bearer ${professionalToken}`)
                .send({
                    status: "COMPLETED"
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.status).toBe("COMPLETED");
            
            console.log(`Successfully completed booking ${confirmedBooking.id}`);
        });

        it("should allow professional to cancel booking with reason", async () => {
            // Get any pending or confirmed booking
            const professionalBookingsResp = await request(app)
                .get("/api/v1/bookings/professional-bookings")
                .set("Authorization", `Bearer ${professionalToken}`)
                .expect(200);

            const cancellableBooking = professionalBookingsResp.body.data.find(
                booking => ['PENDING', 'CONFIRMED'].includes(booking.status)
            );

            if (!cancellableBooking) {
                console.log("Skipping test - no cancellable bookings available");
                return;
            }

            const response = await request(app)
                .patch(`/api/v1/bookings/${cancellableBooking.id}/status`)
                .set("Authorization", `Bearer ${professionalToken}`)
                .send({
                    status: "CANCELLED",
                    cancellationReason: "Professional emergency - unable to attend"
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.status).toBe("CANCELLED");
            expect(response.body.data.cancellationReason).toBe("Professional emergency - unable to attend");
            
            console.log(`Successfully cancelled booking ${cancellableBooking.id}`);
        });

        it("should reject invalid status transitions", async () => {
            // Get a pending booking and try to complete it directly (should fail)
            const professionalBookingsResp = await request(app)
                .get("/api/v1/bookings/professional-bookings?status=pending")
                .set("Authorization", `Bearer ${professionalToken}`)
                .expect(200);

            if (professionalBookingsResp.body.data.length === 0) {
                console.log("Skipping test - no pending bookings available");
                return;
            }

            const pendingBooking = professionalBookingsResp.body.data[0];

            const response = await request(app)
                .patch(`/api/v1/bookings/${pendingBooking.id}/status`)
                .set("Authorization", `Bearer ${professionalToken}`)
                .send({
                    status: "COMPLETED"
                })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toContain("Cannot change booking from PENDING to COMPLETED");
        });

        it("should require cancellation reason when cancelling", async () => {
            const professionalBookingsResp = await request(app)
                .get("/api/v1/bookings/professional-bookings?status=pending")
                .set("Authorization", `Bearer ${professionalToken}`)
                .expect(200);

            if (professionalBookingsResp.body.data.length === 0) {
                console.log("Skipping test - no pending bookings available");
                return;
            }

            const pendingBooking = professionalBookingsResp.body.data[0];

            const response = await request(app)
                .patch(`/api/v1/bookings/${pendingBooking.id}/status`)
                .set("Authorization", `Bearer ${professionalToken}`)
                .send({
                    status: "CANCELLED"
                    // Missing cancellationReason
                })
                .expect(400);

            expect(response.body.success).toBe(false);
            
        });

        it("should reject unauthorized professional", async () => {
            // Login as different professional (Anil)
            const otherProfLogin = await request(app)
                .post("/api/v1/auth/login")
                .send({
                    email: "anil.repair@email.com", // Different professional
                    password: "password123",
                });
            
            const otherProfToken = otherProfLogin.body.data?.token || otherProfLogin.body.token;

            // Try to update Kavya's booking with Anil's token
            const kavyaBookingsResp = await request(app)
                .get("/api/v1/bookings/professional-bookings?status=pending")
                .set("Authorization", `Bearer ${professionalToken}`)
                .expect(200);

            if (kavyaBookingsResp.body.data.length === 0) {
                console.log("Skipping test - no pending bookings available");
                return;
            }

            const kavyaBooking = kavyaBookingsResp.body.data[0];

            const response = await request(app)
                .patch(`/api/v1/bookings/${kavyaBooking.id}/status`)
                .set("Authorization", `Bearer ${otherProfToken}`)
                .send({
                    status: "CONFIRMED"
                })
                .expect(403);

            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toBe("You can only update your own bookings");
        });

        it("should reject customer trying to update status", async () => {
            const professionalBookingsResp = await request(app)
                .get("/api/v1/bookings/professional-bookings?status=pending")
                .set("Authorization", `Bearer ${professionalToken}`)
                .expect(200);

            if (professionalBookingsResp.body.data.length === 0) {
                console.log("Skipping test - no pending bookings available");
                return;
            }

            const professionalBooking = professionalBookingsResp.body.data[0];

            const response = await request(app)
                .patch(`/api/v1/bookings/${professionalBooking.id}/status`)
                .set("Authorization", `Bearer ${customerToken}`)
                .send({
                    status: "CONFIRMED"
                })
                .expect(403);

            expect(response.body.success).toBe(false);
        });
    });

    describe("Customer Cancellation", () => {

        it("should allow customer to cancel PENDING booking with valid reason", async () => {
            const customerBookingsResp = await request(app)
                .get("/api/v1/bookings/my-bookings?status=pending")
                .set("Authorization", `Bearer ${customerToken}`)
                .expect(200);

            if (customerBookingsResp.body.data.length === 0) {
                console.log("Skipping test - no pending bookings available");
                return;
            }

            const pendingBooking = customerBookingsResp.body.data[0];

            const response = await request(app)
                .patch(`/api/v1/bookings/${pendingBooking.id}/cancel`)
                .set("Authorization", `Bearer ${customerToken}`)
                .send({
                    cancellationReason: "Change of plans - no longer needed"
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.status).toBe("CANCELLED");
            expect(response.body.data.cancellationReason).toBe("Change of plans - no longer needed");
            
            console.log(`Successfully cancelled booking ${pendingBooking.id}`);
        });

        it("should allow customer to cancel CONFIRMED booking with valid reason", async () => {
            const customerBookingsResp = await request(app)
                .get("/api/v1/bookings/my-bookings?status=confirmed")
                .set("Authorization", `Bearer ${customerToken}`)
                .expect(200);

            if (customerBookingsResp.body.data.length === 0) {
                console.log("Skipping test - no confirmed bookings available");
                return;
            }

            const confirmedBooking = customerBookingsResp.body.data[0];

            const response = await request(app)
                .patch(`/api/v1/bookings/${confirmedBooking.id}/cancel`)
                .set("Authorization", `Bearer ${customerToken}`)
                .send({
                    cancellationReason: "Emergency came up - need to cancel"
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.status).toBe("CANCELLED");
            
            console.log(`Successfully cancelled confirmed booking ${confirmedBooking.id}`);
        });

        it("should reject cancellation without reason", async () => {
            const customerBookingsResp = await request(app)
                .get("/api/v1/bookings/my-bookings")
                .set("Authorization", `Bearer ${customerToken}`)
                .expect(200);

            const cancellableBooking = customerBookingsResp.body.data.find(
                booking => ['PENDING', 'CONFIRMED'].includes(booking.status)
            );

            if (!cancellableBooking) {
                console.log("Skipping test - no cancellable bookings available");
                return;
            }

            const response = await request(app)
                .patch(`/api/v1/bookings/${cancellableBooking.id}/cancel`)
                .set("Authorization", `Bearer ${customerToken}`)
                .send({
                    // Missing cancellationReason
                })
                .expect(400);

            // expect(response.body.success).toBe(false);
            
        });

        it("should reject cancellation of completed booking", async () => {
            const customerBookingsResp = await request(app)
                .get("/api/v1/bookings/my-bookings?status=completed")
                .set("Authorization", `Bearer ${customerToken}`)
                .expect(200);

            if (customerBookingsResp.body.data.length === 0) {
                console.log("Skipping test - no completed bookings available");
                return;
            }

            const completedBooking = customerBookingsResp.body.data[0];

            const response = await request(app)
                .patch(`/api/v1/bookings/${completedBooking.id}/cancel`)
                .set("Authorization", `Bearer ${customerToken}`)
                .send({
                    cancellationReason: "Trying to cancel completed booking"
                })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toContain("Cannot cancel booking with status COMPLETED");
        });

        it("should reject late cancellation (less than 3 hours)", async () => {
            // First, try to find an existing booking within 3 hours
            const customerBookingsResp = await request(app)
                .get("/api/v1/bookings/my-bookings")
                .set("Authorization", `Bearer ${customerToken}`)
                .expect(200);

            let soonBooking = customerBookingsResp.body.data.find(booking => {
                const hoursUntil = (new Date(booking.scheduledAt) - new Date()) / (1000 * 60 * 60);
                return hoursUntil < 3 && hoursUntil > 0 && ['PENDING', 'CONFIRMED'].includes(booking.status);
            });

            // If no booking within 3 hours exists, create one for testing
            if (!soonBooking) {
                console.log("No booking within 3 hours found, creating test booking...");
                
                // Get services and professional for creating a test booking
                const servicesResp = await request(app)
                    .get("/api/v1/services?page=1&limit=5")
                    .set("Authorization", `Bearer ${customerToken}`)
                    .expect(200);
                
                const serviceId = servicesResp.body.data[0].id;
                
                const proResp = await request(app)
                    .get(`/api/v1/pro/by-service/${serviceId}?page=1&limit=10`)
                    .set("Authorization", `Bearer ${customerToken}`)
                    .expect(200);
                
                const professionalId = proResp.body.data[0].id;
                
                // Find a slot that's soon (you might need to adjust this based on your slot generation)
                const availableSlot = proResp.body.data[0].slots.find(slot => {
                    const hoursUntil = (new Date(slot.startTime) - new Date()) / (1000 * 60 * 60);
                    return hoursUntil > 0 && hoursUntil < 3;
                });

                if (!availableSlot) {
                    console.log("Skipping test - no slots available within 3 hours for test booking creation");
                    return;
                }

                // Get customer address
                const customerResp = await request(app)
                    .get(`/api/v1/users/${customerId}`)
                    .set("Authorization", `Bearer ${customerToken}`)
                    .expect(200);
                
                const addressId = customerResp.body.data.addresses[0].id;

                // Create test booking
                const bookingResp = await request(app)
                    .post("/api/v1/bookings/create-booking")
                    .set("Authorization", `Bearer ${customerToken}`)
                    .send({
                        professionalId,
                        serviceId,
                        slotId: availableSlot.id,
                        addressId,
                        notes: "Test booking for late cancellation test",
                    });

                if (bookingResp.status !== 201) {
                    console.log("Skipping test - could not create test booking");
                    return;
                }

                soonBooking = bookingResp.body.data;
                console.log(`Created test booking ${soonBooking.id} for late cancellation test`);
            }

            const hoursUntil = (new Date(soonBooking.scheduledAt) - new Date()) / (1000 * 60 * 60);
            console.log(`Testing late cancellation with booking ${soonBooking.id} (${hoursUntil.toFixed(2)} hours away)`);

            const response = await request(app)
                .patch(`/api/v1/bookings/${soonBooking.id}/cancel`)
                .set("Authorization", `Bearer ${customerToken}`)
                .send({
                    cancellationReason: "Last minute change"
                })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toContain("Cannot cancel booking less than 24 hours in advance");
        });

        it("should reject unauthorized customer", async () => {
            // Login as different customer
            const otherCustomerLogin = await request(app)
                .post("/api/v1/auth/login")
                .send({
                    email: "anita.nair@email.com", // Different customer
                    password: "password123",
                });
            
            const otherCustomerToken = otherCustomerLogin.body.data?.token || otherCustomerLogin.body.token;

            // Get Arjun's booking
            const arjunBookingsResp = await request(app)
                .get("/api/v1/bookings/my-bookings")
                .set("Authorization", `Bearer ${customerToken}`)
                .expect(200);

            if (arjunBookingsResp.body.data.length === 0) {
                console.log("Skipping test - no bookings available");
                return;
            }

            const arjunBooking = arjunBookingsResp.body.data[0];

            // Try to cancel with Anita's token
            const response = await request(app)
                .patch(`/api/v1/bookings/${arjunBooking.id}/cancel`)
                .set("Authorization", `Bearer ${otherCustomerToken}`)
                .send({
                    cancellationReason: "Unauthorized cancellation"
                })
                .expect(403);

            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toContain("You can only cancel your own bookings");
        });
    });

    
        

        
    
});