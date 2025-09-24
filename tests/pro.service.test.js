import request from "supertest";
import app from "../app.js";
import prisma from "./helpers/db.js";
import jwt from "jsonwebtoken";

let authToken;
let serviceIds = [];
let addressId;
let professionalId;
let userId;

beforeAll(async () => {
    await prisma.$connect();

    // Login and get JWT dynamically
    const loginData = {
        email: "anita.nair@email.com",
        password: "password123",
    };

    const loginResponse = await request(app)
        .post("/api/v1/auth/login")
        .send(loginData)
        .expect(200);

    authToken = loginResponse.body.data?.token || loginResponse.body.token;
    expect(authToken).toBeDefined();

    // ✅ Decode the token to get userId
    const decoded = jwt.decode(authToken);
    userId = decoded.userId;
    expect(userId).toBeDefined();
});

afterAll(async () => {
    await prisma.$disconnect();
});

describe("Pro & Addons APIs", () => {
    it("should fetch services and store multiple serviceIds", async () => {
        const response = await request(app)
            .get("/api/v1/services?page=1&limit=5")
            .set("Authorization", `Bearer ${authToken}`)
            .expect(200);

        expect(Array.isArray(response.body.data)).toBe(true);

        serviceIds = response.body.data.map(svc => svc.id);
        expect(serviceIds.length).toBeGreaterThan(0);
    });

    it("should fetch user and store addressId", async () => {
        const response = await request(app)
            .get(`/api/v1/users/${userId}`)   // ✅ use decoded userId
            .set("Authorization", `Bearer ${authToken}`)
            .expect(200);

        if (response.body.data.addresses?.length > 0) {
            addressId = response.body.data.addresses[0].id;
            expect(addressId).toBeDefined();
        }
    });

    it("should fetch nearby professionals (can be empty)", async () => {
        const response = await request(app)
            .get(`/api/v1/pro/nearby?serviceId=${serviceIds[0]}&addressId=${addressId}`)
            .set("Authorization", `Bearer ${authToken}`)
            .expect(200);

        expect(Array.isArray(response.body.data)).toBe(true);

        if (response.body.data.length > 0) {
            professionalId = response.body.data[0].id;
            expect(professionalId).toBeDefined();
        }
    });

    it("should fetch addons for professional (can be empty)", async () => {
        const proId = professionalId || "746ed828-8ecf-45b8-be4d-0b5193cc00e6";

        const response = await request(app)
            .get(`/api/v1/addons/professional/${proId}`)
            .set("Authorization", `Bearer ${authToken}`)
            .expect(200);

        expect(Array.isArray(response.body.data)).toBe(true);
    });
});
