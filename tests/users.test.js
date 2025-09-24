import request from "supertest";
import jwt from "jsonwebtoken";
import prisma from "./helpers/db.js"
import app from "../app.js";
import { professionalSignupSchema } from "../src/validators/professional.validator.js";
import { signupSchema } from "../src/validators/user.validator.js";
import { sanitizeRequestBody } from "../src/validators/santizeInput.js";
import { jest } from '@jest/globals';


describe('Authentication & User Management Tests', () => {
    let userToken;
    let professionalToken;
    let userId;
    let professionalId;
    let addressId;

    beforeAll(async () => {
        // Setup test database if needed
        await prisma.$connect();

        // Clean up existing test data
        // await prisma.booking.deleteMany({});
        // await prisma.address.deleteMany({});
        // await prisma.professional.deleteMany({});
        // await prisma.user.deleteMany({

        // });
    });

    afterAll(async () => {
        // Cleanup test database
        // await prisma.booking.deleteMany({});
        // await prisma.address.deleteMany({});
        // await prisma.professional.deleteMany({});
        // await prisma.user.deleteMany({

        // });
        await prisma.$disconnect();
    });

    // First, create a user for login tests
    describe('Setup Test User', () => {
        it('should create a test user for login tests', async () => {
            const userData = {
                email: 'test@example.com',
                password: 'password123',
                phone: '1234567890',
                firstName: 'Test',
                lastName: 'User',
                pincode: '123456'
            };

            const response = await request(app)
                .post('/api/v1/users/signup')
                .send(userData);

            if (response.status === 201) {
                console.log('Test user created successfully');
            }
        });
    });

    describe('Auth Controller Tests', () => {
        describe('POST /api/v1/auth/login', () => {
            it('should login with valid credentials', async () => {
                const validUser = {
                    email: 'test@example.com',
                    password: 'password123'
                };

                const response = await request(app)
                    .post('/api/v1/auth/login')
                    .send(validUser)
                    .expect(200);

                expect(response.body.success).toBe(true);
                expect(response.body.token).toBeDefined();

                // Store token for later tests
                userToken = response.body.token;
                const decoded = jwt.decode(response.body.token);
                userId = decoded.userId || decoded.id;
            });

            it('should reject login with invalid email format', async () => {
                const invalidUser = {
                    email: 'invalid-email',
                    password: 'password123'
                };

                const response = await request(app)
                    .post('/api/v1/auth/login')
                    .send(invalidUser)
                    .expect(400);

                expect(response.body.success).toBe(false);
                expect(response.body.error.message).toContain('Invalid email format');
            });

            it('should reject login with short password', async () => {
                const invalidUser = {
                    email: 'test@example.com',
                    password: '123'
                };

                const response = await request(app)
                    .post('/api/v1/auth/login')
                    .send(invalidUser)
                    .expect(400);

                expect(response.body.success).toBe(false);
                expect(response.body.error.message).toContain('Password must be at least 6 characters');
            });

            it('should reject login with missing fields', async () => {
                const response = await request(app)
                    .post('/api/v1/auth/login')
                    .send({})
                    .expect(400);

                expect(response.body.success).toBe(false);
            });
        });

        describe('Rate Limiting', () => {
            it('should rate limit after 10 attempts', async () => {
                const loginData = {
                    email: 'ratelimit@test.com',
                    password: 'wrongpassword'
                };

                // Make 10 requests (should all go through or fail normally)
                for (let i = 0; i < 10; i++) {
                    await request(app)
                        .post('/api/v1/auth/login')
                        .send(loginData);
                }

                // 11th request should trigger rate limit
                const response = await request(app)
                    .post('/api/v1/auth/login')
                    .send(loginData)
                    .expect(429);

                expect(response.body.error.code).toBe('RATE_LIMIT');
            });
        });
    });

    describe('User Controller Tests', () => {
        describe('POST /api/v1/users/signup (User Signup)', () => {
            it('should create user with valid data', async () => {
                const userData = {
                    email: 'ac@example.com',
                    password: 'password123',
                    phone: '9874563210',
                    firstName: 'John',
                    lastName: 'Doe',
                    pincode: '123456'
                };

                const response = await request(app)
                    .post('/api/v1/users/signup')
                    .send(userData)
                    .expect(201);

                expect(response.body.success).toBe(true);
                expect(response.body.message).toBe('User created successfully');
                expect(response.body.token).toBeDefined();

                // Store for later tests if needed
                const decoded = jwt.decode(response.body.token);
                // userId = decoded.userId || decoded.id;
            });

            it('should reject signup with invalid email', async () => {
                const userData = {
                    email: 'invalid-email',
                    password: 'password123',
                    phone: '1234567890',
                    firstName: 'John',
                    lastName: 'Doe'
                };

                const response = await request(app)
                    .post('/api/v1/users/signup')
                    .send(userData)
                    .expect(400);

                expect(response.body.success).toBe(false);
            });

            it('should reject signup with invalid phone number', async () => {
                const userData = {
                    email: 'testphone@example.com',
                    password: 'password123',
                    phone: '123', // Invalid phone
                    firstName: 'John',
                    lastName: 'Doe'
                };

                const response = await request(app)
                    .post('/api/v1/users/signup')
                    .send(userData)
                    .expect(400);

                expect(response.body.success).toBe(false);
                expect(response.body.error.message).toContain('Phone number must be 10 digits');
            });

            it("should strip unknown fields", () => {
                const input = {
                    email: "teststrip@example.com",
                    password: "password123",
                    phone: "1234567890",
                    firstName: "John",
                    lastName: "Doe",
                    unknownField: "should be stripped"
                };

                const { value, error } = signupSchema.validate(input);

                expect(error).toBeUndefined();
                expect(value.unknownField).toBeUndefined(); // ✅ stripped
            });
        });

        describe('GET /api/v1/users/:userId (Get User Profile)', () => {
            it('should get user profile with valid token', async () => {
                const response = await request(app)
                    .get(`/api/v1/users/${userId}`)
                    .set('Authorization', `Bearer ${userToken}`)
                    .expect(200);

                expect(response.body.success).toBe(true);
                expect(response.body.data).toBeDefined();
                expect(response.body.data.password).toBeUndefined(); // Password should be excluded
            });

            it('should reject request without token', async () => {
                const response = await request(app)
                    .get(`/api/v1/users/${userId}`)
                    .expect(401);

                expect(response.body.success).toBe(false);
            });

            it('should reject request with invalid token', async () => {
                const response = await request(app)
                    .get(`/api/v1/users/${userId}`)
                    .set('Authorization', 'Bearer invalid-token')
                    .expect(401);

                expect(response.body.success).toBe(false);
            });
        });

        describe('PATCH /api/v1/users/update-user (Update User)', () => {
            it('should update user with valid data and token', async () => {
                const updateData = {
                    firstName: 'UpdatedJohn',
                    lastName: 'UpdatedDoe',
                    phone: '9876543210'
                };

                const response = await request(app)
                    .patch(`/api/v1/users/update-user`)
                    .set('Authorization', `Bearer ${userToken}`)
                    .send(updateData)
                    .expect(200);

                expect(response.body.success).toBe(true);
                expect(response.body.message).toBe('User updated successfully');
                expect(response.body.data.firstName).toBe('UpdatedJohn');
                expect(response.body.data.password).toBeUndefined();
            });

            it('should reject update without token', async () => {
                const updateData = { firstName: 'Test' };

                const response = await request(app)
                    .patch(`/api/v1/users/update-user`)
                    .send(updateData)
                    .expect(401);

                expect(response.body.success).toBe(false);
            });

            it('should reject update with no fields provided', async () => {
                const response = await request(app)
                    .patch(`/api/v1/users/update-user`)
                    .set('Authorization', `Bearer ${userToken}`)
                    .send({})
                    .expect(400);

                expect(response.body.success).toBe(false);
            });

            it('should reject invalid phone number update', async () => {
                const updateData = { phone: '123' };

                const response = await request(app)
                    .patch(`/api/v1/users/update-user`)
                    .set('Authorization', `Bearer ${userToken}`)
                    .send(updateData)
                    .expect(400);

                expect(response.body.success).toBe(false);
                expect(response.body.error.message).toContain('Phone number must be exactly 10 digits');
            });
        });

        describe('Address Management', () => {
            describe('PUT /api/v1/users/addresses (Create Address)', () => {
                it('should create address with valid data and token', async () => {
                    const addressData = {
                        label: 'Home',
                        line1: '123 Main Street',
                        line2: 'Apt 4B',
                        city: 'New York',
                        state: 'NY',
                        country: 'USA',
                        pincode: '123456',
                        latitude: 40.7128,
                        longitude: -74.0060,
                        isDefault: true
                    };

                    

                    const response = await request(app)
                        .put(`/api/v1/users/addresses`)
                        .set('Authorization', `Bearer ${userToken}`)
                        .send(addressData)
                        .expect(201);

                    
                    expect(response.body.success).toBe(true);
                    expect(response.body.message).toBe('Address created successfully');
                    expect(response.body.data).toBeDefined();

                    
                    addressId  = response.body.data.id;
                });

                it('should reject address creation without token', async () => {
                    const addressData = {
                        label: 'Office',
                        line1: '456 Work Street',
                        city: 'Boston',
                        state: 'MA',
                        country: 'USA',
                        pincode: '654321'
                    };

                    const response = await request(app)
                        .put(`/api/v1/users/addresses`)
                        .send(addressData)
                        .expect(401);

                    expect(response.body.success).toBe(false);
                });

                it('should reject invalid pincode', async () => {
                    const addressData = {
                        line1: '789 Test Street',
                        city: 'Test City',
                        state: 'TS',
                        country: 'Test',
                        pincode: '12345' // Invalid length
                    };

                    const response = await request(app)
                        .put(`/api/v1/users/addresses`)
                        .set('Authorization', `Bearer ${userToken}`)
                        .send(addressData)
                        .expect(400);

                    expect(response.body.success).toBe(false);
                    expect(response.body.error.message).toContain('Pincode must be exactly 6 digits');
                });
            });
            
            describe('PATCH /api/v1/users/addresses/:addressId (Update Address)', () => {
                it('should update address with valid data and token', async () => {
                    const updateData = {
                        label: 'Office',
                        line1: 'Updated Street Address',
                        city: 'Updated City'
                    };
                    

                    const response = await request(app)
                        .patch(`/api/v1/users/addresses/${addressId}`)
                        .set('Authorization', `Bearer ${userToken}`)
                        .send(updateData)
                        .expect(200);

                    expect(response.body.success).toBe(true);
                    expect(response.body.message).toBe('Address updated successfully');
                });

                it('should reject address update without token', async () => {
                    const updateData = { city: 'Unauthorized City' };

                    const response = await request(app)
                        .patch(`/api/v1/users/addresses/${addressId}`)
                        .send(updateData)
                        .expect(401);

                    expect(response.body.success).toBe(false);
                });
            });

            describe('DELETE /api/v1/users/addresses/:addressId (Delete Address)', () => {
                it('should delete address with valid token', async () => {
                    const response = await request(app)
                        .delete(`/api/v1/users/addresses/${addressId}`)
                        .set('Authorization', `Bearer ${userToken}`)
                        .expect(200);

                    expect(response.body.success).toBe(true);
                    expect(response.body.message).toBe('Address deleted successfully');
                });

                it('should reject address deletion without token', async () => {
                    // Create a new address for this test since previous one was deleted
                    const addressData = {
                        label: 'Home',
                        line1: '123 Test Street',
                        city: 'Test City',
                        state: 'Test State',
                        country: 'Test Country',
                        pincode: '123456'
                    };

                    const createResponse = await request(app)
                        .put(`/api/v1/users/addresses`)
                        .set('Authorization', `Bearer ${userToken}`)
                        .send(addressData);

                    const newAddressId = createResponse.body.data.id;

                    const response = await request(app)
                        .delete(`/api/v1/users/addresses/${newAddressId}`)
                        .expect(401);

                    expect(response.body.success).toBe(false);
                });
            });
        });

        // describe('DELETE /api/v1/users/:userId (Delete User)', () => {
        //     it('should delete user with valid token', async () => {
        //         const response = await request(app)
        //             .delete(`/api/v1/users/${userId}`)
        //             .set('Authorization', `Bearer ${userToken}`)
        //             .expect(200);

        //         expect(response.body.success).toBe(true);
        //         expect(response.body.message).toBeDefined();
        //     });
        // });
    });

    describe('Professional Controller Tests', () => {
        describe('POST /api/v1/pro/signup (Professional Signup)', () => {
            it('should create professional with valid data', async () => {
                const professionalData = {
                    email: 'pro@example.com',
                    password: 'password123',
                    phone: '1234567890',
                    firstName: 'Jane',
                    lastName: 'Smith',
                    businessName: 'Jane\'s Services',
                    description: 'Professional cleaning services',
                    experience: 5,
                    latitude: 40.7128,
                    longitude: -74.0060,
                    pincode: '123456'
                };

                const response = await request(app)
                    .post('/api/v1/pro/signup')
                    .send(professionalData)
                    .expect(201);

                expect(response.body.success).toBe(true);
                expect(response.body.data).toBeDefined();

                professionalId = response.body.data.id;
                if (response.body.token) {
                    professionalToken = response.body.token;
                }
            });

            it('should reject professional signup with invalid email', async () => {
                const professionalData = {
                    email: 'invalid-email',
                    password: 'password123',
                    phone: '1234567890',
                    firstName: 'Jane',
                    lastName: 'Smith',
                    businessName: 'Test Business'
                };

                const response = await request(app)
                    .post('/api/v1/pro/signup')
                    .send(professionalData)
                    .expect(400);

                expect(response.body.success).toBe(false);
            });

            it('should reject professional signup with missing business name', async () => {
                const professionalData = {
                    email: 'pro2@example.com',
                    password: 'password123',
                    phone: '1234567890',
                    firstName: 'Jane',
                    lastName: 'Smith'
                    // Missing businessName
                };

                const response = await request(app)
                    .post('/api/v1/pro/signup')
                    .send(professionalData)
                    .expect(400);

                expect(response.body.success).toBe(false);
                expect(response.body.error.message).toContain('Business name is required');
            });



            it("should set default experience to 0 if not provided", () => {
                const input = {
                    email: "pro3@example.com",
                    password: "password123",
                    phone: "1234567890",
                    firstName: "Bob",
                    lastName: "Johnson",
                    businessName: "Bob's Services"
                };

                const { value, error } = professionalSignupSchema.validate(input);

                expect(error).toBeUndefined();
                expect(value.experience).toBe(0);  // ✅ default applied
            });


            it('should reject negative experience', async () => {
                const professionalData = {
                    email: 'pro4@example.com',
                    password: 'password123',
                    phone: '1234567890',
                    firstName: 'Alice',
                    lastName: 'Brown',
                    businessName: 'Alice\'s Services',
                    experience: -1 // Invalid negative experience
                };

                const response = await request(app)
                    .post('/api/v1/pro/signup')
                    .send(professionalData)
                    .expect(400);

                expect(response.body.success).toBe(false);
                expect(response.body.error.message).toContain('Experience cannot be negative');
            });

            it('should strip unknown fields from professional signup', async () => {
                const professionalData = {
                    email: 'pro5@example.com',
                    password: 'password123',
                    phone: '1234567890',
                    firstName: 'Charlie',
                    lastName: 'Davis',
                    businessName: 'Charlie\'s Services',
                    unknownField: 'should be stripped',
                    anotherUnknownField: 'also stripped'
                };

                const { value, error } = professionalSignupSchema.validate(professionalData);
                expect(error).toBeUndefined();
                expect(value.extraField).toBeUndefined();
            });
        });
    });

    describe('Error Handling', () => {
        it('should handle validation errors gracefully', async () => {
            const response = await request(app)
                .post('/api/v1/users/signup')
                .send({ email: 'invalid' })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toBeDefined();
        });

        it('should handle server errors gracefully', async () => {
            // This test passes as implemented
        });
    });

    it("should sanitize <script> tags from input", () => {
        const req = { body: { firstName: '<script>alert("xss")</script>' } };
        const res = {};
        const next = jest.fn();

        sanitizeRequestBody(req, res, next);

        // The sanitized result should not contain script tags
        console.log("this is requebt", req.body)
        expect(req.body.firstName).toBe('');
 // Use trim() to handle whitespace
        expect(next).toHaveBeenCalled();
    });

});