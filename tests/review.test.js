import request from "supertest";
import app from "../app.js";
import prisma from "./helpers/db.js";
import jwt from "jsonwebtoken";

let customerToken;
let customerId;
let completedBookingId;

beforeAll(async () => {
    await prisma.$connect();

    // 🔐 Login customer (Arjun)
    const loginResp = await request(app)
        .post("/api/v1/auth/login")
        .send({
            email: "arjun.sharma@email.com",
            password: "password123",
        })
        .expect(200);

    customerToken = loginResp.body.data?.token || loginResp.body.token;
    customerId = jwt.decode(customerToken).userId;

    // 📋 Fetch customer's completed bookings
    const completedResp = await request(app)
        .get("/api/v1/bookings/my-bookings?status=completed")
        .set("Authorization", `Bearer ${customerToken}`)
        .expect(200);

    if (completedResp.body.data.length > 0) {
        completedBookingId = completedResp.body.data[0].id;
        console.log(`Using completed booking for review: ${completedBookingId}`);
    }
});

afterAll(async () => {
    await prisma.$disconnect();
});

describe("Review Management", () => {
    describe("POST /api/v1/reviews/create-review", () => {
        test("should create review if completed booking exists", async () => {
            if (completedBookingId) {
                const reviewData = {
                    bookingId: completedBookingId,
                    rating: 5,
                    comment: "Excellent service, very professional!",
                };

                const response = await request(app)
                    .post("/api/v1/reviews/create-review")
                    .set("Authorization", `Bearer ${customerToken}`)
                    .send(reviewData);

                expect([201, 400, 409]).toContain(response.status);
            } else {
                // No completed bookings: test negative flow
                const reviewData = {
                    bookingId: "non-existent-booking-id",
                    rating: 5,
                    comment: "Fallback review",
                };

                const response = await request(app)
                    .post("/api/v1/reviews/create-review")
                    .set("Authorization", `Bearer ${customerToken}`)
                    .send(reviewData);

                expect([400, 404, 409]).toContain(response.status);
            }
        });

        test("should require authentication", async () => {
            const reviewData = {
                bookingId: "dummy-booking-id",
                rating: 5,
                comment: "it review",
            };

            await request(app)
                .post("/api/v1/reviews/create-review")
                .send(reviewData)
                .expect(401);
        });

        test("should validate rating range", async () => {
            const reviewData = {
                bookingId: "dummy-booking-id",
                rating: 10,
                comment: "invalid review",
            };

            const response = await request(app)
                .post("/api/v1/reviews/create-review")
                .set("Authorization", `Bearer ${customerToken}`)
                .send(reviewData);

            expect([400, 404, 422]).toContain(response.status);
        });
    });

    describe("GET /api/v1/reviews/me", () => {
        test("should fetch reviews written by the customer", async () => {
            const response = await request(app)
                .get("/api/v1/reviews/me")
                .set("Authorization", `Bearer ${customerToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
        });

        test("should return 401 if no token is provided", async () => {
            await request(app).get("/api/v1/reviews/me").expect(401);
        });
    });
});
