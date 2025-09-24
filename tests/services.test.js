import request from "supertest";
import app from "../app.js";   // your Express app
import prisma from "./helpers/db.js";

let authToken;
let serviceIdFromList;
let serviceIdFromSearch;

beforeAll(async () => {
    await prisma.$connect();

    // 🔐 Login and get JWT dynamically
    const loginData = {
        email: "anita.nair@email.com",
        password: "password123",
    };

    const loginResponse = await request(app)
        .post("/api/v1/auth/login")
        .send(loginData)
        .expect(200);

    // ⚡ Make sure you read the correct path
    authToken = loginResponse.body.data?.token || loginResponse.body.token;

    expect(authToken).toBeDefined();
});

afterAll(async () => {
    await prisma.$disconnect();
});

describe("Services API", () => {
    it("should fetch paginated services list", async () => {
        const response = await request(app)
            .get("/api/v1/services?page=1&limit=20")
            .set("Authorization", `Bearer ${authToken}`)
            .expect(200);

        expect(response.body).toBeDefined();
        expect(Array.isArray(response.body.data)).toBe(true);

        if (response.body.data.length > 0) {
            serviceIdFromList = response.body.data[0].id; // ✅ store dynamically
            expect(serviceIdFromList).toBeDefined();
        }
    });

    it("should search services by query", async () => {
        const response = await request(app)
            .get("/api/v1/services/search?q=hair&page=1&limit=10")
            .set("Authorization", `Bearer ${authToken}`)
            .expect(200);

        expect(response.body).toBeDefined();
        expect(Array.isArray(response.body.data)).toBe(true);

        if (response.body.data.length > 0) {
            serviceIdFromSearch = response.body.data[0].id; // ✅ store dynamically
            expect(serviceIdFromSearch).toBeDefined();
        }
    });

    it("should fetch service by ID from list", async () => {
        expect(serviceIdFromList).toBeDefined(); // make sure it was set

        const response = await request(app)
            .get(`/api/v1/services/${serviceIdFromList}`)
            .set("Authorization", `Bearer ${authToken}`)
            .expect(200);

        expect(response.body).toBeDefined();
        expect(response.body.data).toHaveProperty("id", serviceIdFromList);
    });

    it("should fetch service by ID from search", async () => {
        expect(serviceIdFromSearch).toBeDefined(); // make sure it was set

        const response = await request(app)
            .get(`/api/v1/services/${serviceIdFromSearch}`)
            .set("Authorization", `Bearer ${authToken}`)
            .expect(200);

        expect(response.body).toBeDefined();
        expect(response.body.success).toBe(true);

        // 👇 response.body.data should be a single object
        expect(typeof response.body.data).toBe("object");
        expect(response.body.data).toHaveProperty("id", serviceIdFromSearch);
        expect(response.body.data).toHaveProperty("name"); // extra check
    });

});
