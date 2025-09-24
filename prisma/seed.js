import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()


// Utility function to hash passwords
const hashPassword = async (password) => {
    return await bcrypt.hash(password, 12);
};

// Generate random coordinates within a city (Bangalore example)
const generateCoordinates = () => {
    const bangaloreBase = { lat: 12.9716, lng: 77.5946 };
    const radius = 0.3; // ~30km radius

    const latitude =
        bangaloreBase.lat + (Math.random() - 0.5) * radius;
    const longitude =
        bangaloreBase.lng + (Math.random() - 0.5) * radius;

    return {
        latitude: Number(latitude.toFixed(6)),   // keep 6 decimals
        longitude: Number(longitude.toFixed(6))  // keep 6 decimals
    };
};


// Generate random pincode (Bangalore area)
const generatePincode = () => {
    const bangalorePincodes = [
        '560001', '560002', '560003', '560004', '560005', '560006', '560007', '560008',
        '560009', '560010', '560011', '560012', '560013', '560016', '560017', '560018',
        '560019', '560020', '560021', '560022', '560023', '560024', '560025', '560026',
        '560027', '560028', '560029', '560030', '560032', '560033', '560034', '560035',
        '560036', '560037', '560038', '560040', '560041', '560042', '560043', '560045',
        '560046', '560047', '560048', '560049', '560050', '560051', '560052', '560053',
        '560054', '560055', '560056', '560061', '560062', '560064', '560066', '560067',
        '560068', '560070', '560071', '560072', '560075', '560076', '560078', '560079',
        '560080', '560083', '560084', '560085', '560087', '560092', '560093', '560094',
        '560095', '560096', '560097', '560098', '560100', '560102', '560103', '560106'
    ];
    return bangalorePincodes[Math.floor(Math.random() * bangalorePincodes.length)];
};

async function main() {
    console.log(' Starting seeding process...');

    // Clean existing data
    console.log(' Cleaning existing data...');
    await prisma.bookingAddon.deleteMany({});
    await prisma.booking.deleteMany({});
    await prisma.slot.deleteMany({});
    await prisma.review.deleteMany({});
    await prisma.availability.deleteMany({});
    await prisma.professionalServiceAddon.deleteMany({});
    await prisma.professionalService.deleteMany({});
    await prisma.professional.deleteMany({});
    await prisma.priceRule.deleteMany({});
    await prisma.addon.deleteMany({});
    await prisma.service.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.address.deleteMany({});
    await prisma.user.deleteMany({});

    // 1. Create Categories
    console.log(' Creating categories...');
    const categories = await Promise.all([
        prisma.category.create({
            data: {
                name: 'Home Cleaning',
                description: 'Professional home cleaning services',
                icon: '🏠',
                isActive: true
            }
        }),
        prisma.category.create({
            data: {
                name: 'Beauty & Wellness',
                description: 'Beauty treatments and wellness services at home',
                icon: '💄',
                isActive: true
            }
        }),
        prisma.category.create({
            data: {
                name: 'Home Repairs',
                description: 'Electrical, plumbing, and appliance repairs',
                icon: '🔧',
                isActive: true
            }
        }),
        prisma.category.create({
            data: {
                name: 'Massage & Spa',
                description: 'Relaxing massage and spa services',
                icon: '💆',
                isActive: true
            }
        }),
        prisma.category.create({
            data: {
                name: 'Fitness & Yoga',
                description: 'Personal training and yoga sessions',
                icon: '🧘',
                isActive: true
            }
        }),
        prisma.category.create({
            data: {
                name: 'Pest Control',
                description: 'Professional pest control services',
                icon: '🐛',
                isActive: true
            }
        })
    ]);

    // 2. Create Services for each category
    console.log(' Creating services...');
    const services = [];

    // Home Cleaning Services
    const cleaningServices = await Promise.all([
        prisma.service.create({
            data: {
                categoryId: categories[0].id,
                name: 'Full House Cleaning',
                description: 'Complete house cleaning including all rooms, kitchen, and bathrooms',
                basePrice: 799,
                durationMinutes: 180,
                metadata: { recommended: true }
            }
        }),
        prisma.service.create({
            data: {
                categoryId: categories[0].id,
                name: 'Kitchen Deep Clean',
                description: 'Deep cleaning of kitchen including appliances, cabinets, and countertops',
                basePrice: 549,
                durationMinutes: 120,
                metadata: {}
            }
        }),
        prisma.service.create({
            data: {
                categoryId: categories[0].id,
                name: 'Bathroom Deep Clean',
                description: 'Thorough bathroom cleaning with sanitization',
                basePrice: 399,
                durationMinutes: 90,
                metadata: {}
            }
        }),
        prisma.service.create({
            data: {
                categoryId: categories[0].id,
                name: 'Sofa Cleaning',
                description: 'Professional sofa and upholstery cleaning',
                basePrice: 699,
                durationMinutes: 120,
                metadata: {}
            }
        })
    ]);

    // Beauty Services
    const beautyServices = await Promise.all([
        prisma.service.create({
            data: {
                categoryId: categories[1].id,
                name: 'Hair Cut & Styling',
                description: 'Professional hair cutting and styling at home',
                basePrice: 299,
                durationMinutes: 60,
                metadata: { gender: 'both' }
            }
        }),
        prisma.service.create({
            data: {
                categoryId: categories[1].id,
                name: 'Facial Treatment',
                description: 'Relaxing facial treatment with organic products',
                basePrice: 899,
                durationMinutes: 90,
                metadata: { popular: true }
            }
        }),
        prisma.service.create({
            data: {
                categoryId: categories[1].id,
                name: 'Manicure & Pedicure',
                description: 'Complete nail care treatment',
                basePrice: 649,
                durationMinutes: 75,
                metadata: {}
            }
        }),
        prisma.service.create({
            data: {
                categoryId: categories[1].id,
                name: 'Bridal Makeup',
                description: 'Professional bridal makeup and styling',
                basePrice: 4999,
                durationMinutes: 180,
                metadata: { special: true }
            }
        })
    ]);

    // Home Repair Services
    const repairServices = await Promise.all([
        prisma.service.create({
            data: {
                categoryId: categories[2].id,
                name: 'Electrical Repair',
                description: 'Electrical wiring, switch, and fixture repairs',
                basePrice: 299,
                durationMinutes: 60,
                metadata: { emergency: true }
            }
        }),
        prisma.service.create({
            data: {
                categoryId: categories[2].id,
                name: 'Plumbing Repair',
                description: 'Tap, pipe, and drainage repair services',
                basePrice: 349,
                durationMinutes: 90,
                metadata: { emergency: true }
            }
        }),
        prisma.service.create({
            data: {
                categoryId: categories[2].id,
                name: 'AC Repair & Service',
                description: 'Air conditioner repair and maintenance',
                basePrice: 599,
                durationMinutes: 120,
                metadata: { seasonal: true }
            }
        }),
        prisma.service.create({
            data: {
                categoryId: categories[2].id,
                name: 'Appliance Repair',
                description: 'Washing machine, microwave, and other appliance repairs',
                basePrice: 399,
                durationMinutes: 90,
                metadata: {}
            }
        })
    ]);

    // Massage Services
    const massageServices = await Promise.all([
        prisma.service.create({
            data: {
                categoryId: categories[3].id,
                name: 'Swedish Massage',
                description: 'Relaxing Swedish massage therapy',
                basePrice: 1299,
                durationMinutes: 60,
                metadata: { therapyType: 'relaxation' }
            }
        }),
        prisma.service.create({
            data: {
                categoryId: categories[3].id,
                name: 'Deep Tissue Massage',
                description: 'Therapeutic deep tissue massage for muscle relief',
                basePrice: 1599,
                durationMinutes: 90,
                metadata: { therapyType: 'therapeutic' }
            }
        }),
        prisma.service.create({
            data: {
                categoryId: categories[3].id,
                name: 'Couple Massage',
                description: 'Relaxing massage for couples',
                basePrice: 2499,
                durationMinutes: 90,
                metadata: { special: true }
            }
        })
    ]);

    // Fitness Services
    const fitnessServices = await Promise.all([
        prisma.service.create({
            data: {
                categoryId: categories[4].id,
                name: 'Personal Training',
                description: 'One-on-one fitness training session',
                basePrice: 999,
                durationMinutes: 60,
                metadata: { intensity: 'high' }
            }
        }),
        prisma.service.create({
            data: {
                categoryId: categories[4].id,
                name: 'Yoga Session',
                description: 'Private yoga session with certified instructor',
                basePrice: 799,
                durationMinutes: 75,
                metadata: { intensity: 'low' }
            }
        }),
        prisma.service.create({
            data: {
                categoryId: categories[4].id,
                name: 'Pilates Training',
                description: 'Pilates workout session for core strength',
                basePrice: 899,
                durationMinutes: 60,
                metadata: { intensity: 'medium' }
            }
        })
    ]);

    // Pest Control Services
    const pestServices = await Promise.all([
        prisma.service.create({
            data: {
                categoryId: categories[5].id,
                name: 'Cockroach Control',
                description: 'Professional cockroach extermination',
                basePrice: 899,
                durationMinutes: 120,
                metadata: { warranty: '3 months' }
            }
        }),
        prisma.service.create({
            data: {
                categoryId: categories[5].id,
                name: 'Termite Control',
                description: 'Complete termite treatment and prevention',
                basePrice: 2999,
                durationMinutes: 240,
                metadata: { warranty: '5 years' }
            }
        }),
        prisma.service.create({
            data: {
                categoryId: categories[5].id,
                name: 'General Pest Control',
                description: 'Comprehensive pest control for all common pests',
                basePrice: 1499,
                durationMinutes: 180,
                metadata: { warranty: '6 months' }
            }
        })
    ]);

    services.push(...cleaningServices, ...beautyServices, ...repairServices, ...massageServices, ...fitnessServices, ...pestServices);

    // 3. Create Addons for services
    console.log(' Creating addons...');
    const addons = [];

    // Cleaning addons
    for (const service of cleaningServices) {
        const serviceAddons = await Promise.all([
            prisma.addon.create({
                data: {
                    serviceId: service.id,
                    name: 'Inside Fridge Cleaning',
                    description: 'Deep cleaning inside refrigerator',
                    basePrice: 199,
                    isActive: true
                }
            }),
            prisma.addon.create({
                data: {
                    serviceId: service.id,
                    name: 'Inside Oven Cleaning',
                    description: 'Deep cleaning inside oven/microwave',
                    basePrice: 149,
                    isActive: true
                }
            }),
            prisma.addon.create({
                data: {
                    serviceId: service.id,
                    name: 'Balcony Cleaning',
                    description: 'Additional balcony cleaning',
                    basePrice: 99,
                    isActive: true
                }
            })
        ]);
        addons.push(...serviceAddons);
    }

    // Beauty addons
    for (const service of beautyServices.slice(0, 2)) { // Only for hair and facial
        const serviceAddons = await Promise.all([
            prisma.addon.create({
                data: {
                    serviceId: service.id,
                    name: 'Hair Wash',
                    description: 'Premium hair wash with conditioner',
                    basePrice: 99,
                    isActive: true
                }
            }),
            prisma.addon.create({
                data: {
                    serviceId: service.id,
                    name: 'Face Mask',
                    description: 'Nourishing face mask treatment',
                    basePrice: 199,
                    isActive: true
                }
            })
        ]);
        addons.push(...serviceAddons);
    }

    // 4. Create Users (Customers and Professionals)
    console.log(' Creating users...');

    // Create customers
    const customers = [];
    const customerData = [
        { firstName: 'Arjun', lastName: 'Sharma', email: 'arjun.sharma@email.com', phone: '+919876543210' },
        { firstName: 'Priya', lastName: 'Patel', email: 'priya.patel@email.com', phone: '+919876543211' },
        { firstName: 'Rahul', lastName: 'Kumar', email: 'rahul.kumar@email.com', phone: '+919876543212' },
        { firstName: 'Sneha', lastName: 'Singh', email: 'sneha.singh@email.com', phone: '+919876543213' },
        { firstName: 'Vikram', lastName: 'Reddy', email: 'vikram.reddy@email.com', phone: '+919876543214' },
        { firstName: 'Anita', lastName: 'Nair', email: 'anita.nair@email.com', phone: '+919876543215' },
        { firstName: 'Suresh', lastName: 'Gupta', email: 'suresh.gupta@email.com', phone: '+919876543216' },
        { firstName: 'Meera', lastName: 'Joshi', email: 'meera.joshi@email.com', phone: '+919876543217' }
    ];

    for (const customer of customerData) {
        const user = await prisma.user.create({
            data: {
                firstName: customer.firstName,
                lastName: customer.lastName,
                email: customer.email,
                phone: customer.phone,
                password: await hashPassword('password123'),
                role: 'CUSTOMER',
                pincode: generatePincode(),
                isActive: true
            }
        });
        customers.push(user);
    }

    // Create professional users
    const professionals = [];
    const professionalData = [
        // Cleaning professionals
        { firstName: 'Ravi', lastName: 'Kumar', email: 'ravi.cleaner@email.com', phone: '+919876540001', category: 'cleaning' },
        { firstName: 'Sunita', lastName: 'Devi', email: 'sunita.cleaner@email.com', phone: '+919876540002', category: 'cleaning' },
        { firstName: 'Mohan', lastName: 'Lal', email: 'mohan.cleaner@email.com', phone: '+919876540003', category: 'cleaning' },

        // Beauty professionals  
        { firstName: 'Kavya', lastName: 'Rao', email: 'kavya.beauty@email.com', phone: '+919876540004', category: 'beauty' },
        { firstName: 'Deepa', lastName: 'Menon', email: 'deepa.beauty@email.com', phone: '+919876540005', category: 'beauty' },
        { firstName: 'Sanjana', lastName: 'Iyer', email: 'sanjana.beauty@email.com', phone: '+919876540006', category: 'beauty' },

        // Repair professionals
        { firstName: 'Rajesh', lastName: 'Electrician', email: 'rajesh.repair@email.com', phone: '+919876540007', category: 'repair' },
        { firstName: 'Sunil', lastName: 'Plumber', email: 'sunil.repair@email.com', phone: '+919876540008', category: 'repair' },
        { firstName: 'Anil', lastName: 'Technician', email: 'anil.repair@email.com', phone: '+919876540009', category: 'repair' },

        // Massage professionals
        { firstName: 'Lakshmi', lastName: 'Therapist', email: 'lakshmi.massage@email.com', phone: '+919876540010', category: 'massage' },
        { firstName: 'Prakash', lastName: 'Masseur', email: 'prakash.massage@email.com', phone: '+919876540011', category: 'massage' },

        // Fitness professionals
        { firstName: 'Kiran', lastName: 'Trainer', email: 'kiran.fitness@email.com', phone: '+919876540012', category: 'fitness' },
        { firstName: 'Yoga', lastName: 'Guru', email: 'yoga.fitness@email.com', phone: '+919876540013', category: 'fitness' },

        // Pest control professionals
        { firstName: 'Ramesh', lastName: 'PestControl', email: 'ramesh.pest@email.com', phone: '+919876540014', category: 'pest' }
    ];

    for (const prof of professionalData) {
        const coords = generateCoordinates();
        const user = await prisma.user.create({
            data: {
                firstName: prof.firstName,
                lastName: prof.lastName,
                email: prof.email,
                phone: prof.phone,
                password: await hashPassword('password123'),
                role: 'PROFESSIONAL',
                pincode: generatePincode(),
                isActive: true
            }
        });

        const professional = await prisma.professional.create({
            data: {
                userId: user.id,
                businessName: `${prof.firstName}'s ${prof.category} Service`,
                description: `Professional ${prof.category} service provider with years of experience`,
                experience: Math.floor(Math.random() * 10) + 2, // 2-12 years
                rating: parseFloat((Math.random() * 2 + 3).toFixed(1)), // 3.0-5.0 rating
                totalReviews: Math.floor(Math.random() * 200) + 10, // 10-210 reviews
                serviceRadius: Math.floor(Math.random() * 20) + 10, // 10-30 km
                isVerified: Math.random() > 0.3, // 70% verified
                isAvailable: true,
                profileImage: `https://api.dicebear.com/7.x/personas/svg?seed=${prof.firstName}`,
                latitude: coords.latitude,
                longitude: coords.longitude,
                pincode: generatePincode()
            }
        });

        professionals.push({ ...professional, user, category: prof.category });
    }

    // 5. Create Professional Services (map professionals to services)
    console.log(' Creating professional services...');

    const categoryServiceMap = {
        'cleaning': cleaningServices,
        'beauty': beautyServices,
        'repair': repairServices,
        'massage': massageServices,
        'fitness': fitnessServices,
        'pest': pestServices
    };

    for (const prof of professionals) {
        const categoryServices = categoryServiceMap[prof.category] || [];

        for (const service of categoryServices) {
            // 80% chance professional offers this service
            if (Math.random() > 0.2) {
                await prisma.professionalService.create({
                    data: {
                        professionalId: prof.id,
                        serviceId: service.id,
                        customPrice: Math.random() > 0.7 ? service.basePrice * (0.8 + Math.random() * 0.4) : null, // 30% have custom pricing
                        isOffered: true
                    }
                });
            }
        }
    }

    // 6. Create Professional Service Addons
    console.log(' Creating professional service addons...');
    for (const prof of professionals) {
        const relevantAddons = addons.filter(addon => {
            const service = services.find(s => s.id === addon.serviceId);
            if (!service) return false;

            const category = categories.find(c => c.id === service.categoryId);
            return category && category.name.toLowerCase().includes(prof.category);
        });

        for (const addon of relevantAddons) {
            // 60% chance professional offers this addon
            if (Math.random() > 0.4) {
                await prisma.professionalServiceAddon.create({
                    data: {
                        professionalId: prof.id,
                        addonId: addon.id,
                        customPrice: Math.random() > 0.8 ? addon.basePrice * (0.9 + Math.random() * 0.2) : null,
                        isOffered: true
                    }
                });
            }
        }
    }

    // 7. Create Availability for professionals
    console.log(' Creating availability...');
    for (const prof of professionals) {
        // Create availability for each day of the week
        const availabilityPattern = Math.random() > 0.5 ? 'morning' : 'flexible';

        for (let day = 0; day < 7; day++) {
            // Skip some days randomly (professionals don't work all 7 days)
            if (Math.random() > 0.85) continue;

            let slots = [];
            if (availabilityPattern === 'morning') {
                slots = [
                    { start: '09:00', end: '12:00' },
                    { start: '14:00', end: '17:00' }
                ];
            } else {
                slots = [
                    { start: '08:00', end: '11:00' },
                    { start: '15:00', end: '19:00' }
                ];
            }

            for (const slot of slots) {
                await prisma.availability.create({
                    data: {
                        professionalId: prof.id,
                        dayOfWeek: day,
                        startTime: slot.start,
                        endTime: slot.end,
                        isAvailable: true
                    }
                });
            }
        }
    }

    // 8. Create Addresses for customers
    console.log(' Creating addresses...');
    const areas = [
        'Koramangala', 'Indiranagar', 'Whitefield', 'Electronic City', 'HSR Layout',
        'BTM Layout', 'Jayanagar', 'Malleshwaram', 'Rajajinagar', 'Banashankari'
    ];

    for (const customer of customers) {
        const numAddresses = Math.floor(Math.random() * 2) + 1; // 1-2 addresses

        for (let i = 0; i < numAddresses; i++) {
            const coords = generateCoordinates();
            const area = areas[Math.floor(Math.random() * areas.length)];

            await prisma.address.create({
                data: {
                    userId: customer.id,
                    label: i === 0 ? 'Home' : 'Office',
                    line1: `${Math.floor(Math.random() * 999) + 1}, ${area}`,
                    line2: `${Math.floor(Math.random() * 20) + 1}th Main Road`,
                    city: 'Bangalore',
                    state: 'Karnataka',
                    country: 'India',
                    pincode: generatePincode(),
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                    isDefault: i === 0
                }
            });
        }
    }

    // 9. Create Time Slots for professionals
    console.log(' Creating time slots...');
    const now = new Date();
    const futureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

    for (const prof of professionals) {
        // Generate slots for next 30 days
        for (let d = 0; d < 35; d++) {
            const date = new Date(now.getTime() + d * 24 * 60 * 60 * 1000);
            const dayOfWeek = date.getDay();

            // Get availability for this day
            const availability = await prisma.availability.findMany({
                where: {
                    professionalId: prof.id,
                    dayOfWeek: dayOfWeek,
                    isAvailable: true
                }
            });

            for (const avail of availability) {
                const [startHour, startMin] = avail.startTime.split(':').map(Number);
                const [endHour, endMin] = avail.endTime.split(':').map(Number);

                // Create hourly slots
                for (let hour = startHour; hour < endHour; hour++) {
                    const slotStart = new Date(date);
                    slotStart.setHours(hour, startMin, 0, 0);

                    const slotEnd = new Date(slotStart);
                    slotEnd.setHours(hour + 1, startMin, 0, 0);

                    // Don't create slots in the past
                    if (slotStart <= now) continue;

                    await prisma.slot.create({
                        data: {
                            professionalId: prof.id,
                            startAt: slotStart,
                            endAt: slotEnd,
                            state: 'AVAILABLE'
                        }
                    });
                }
            }
        }
    }

    // 10. Create some sample bookings
    console.log(' Creating sample bookings...');
    const allSlots = await prisma.slot.findMany({
        where: { state: 'AVAILABLE' }
    });

    const customerAddresses = await prisma.address.findMany();

    for (let i = 0; i < 50; i++) {
        const customer = customers[Math.floor(Math.random() * customers.length)];
        const slot = allSlots[Math.floor(Math.random() * allSlots.length)];
        const professional = professionals.find(p => p.id === slot.professionalId);

        if (!professional) continue;

        // Get a service this professional offers
        const professionalServices = await prisma.professionalService.findMany({
            where: { professionalId: professional.id },
            include: { service: true }
        });

        if (professionalServices.length === 0) continue;

        const professionalService = professionalServices[Math.floor(Math.random() * professionalServices.length)];
        const service = professionalService.service;

        // Get customer's address
        const customerAddress = customerAddresses.find(addr => addr.userId === customer.id);
        if (!customerAddress) continue;

        // Calculate price
        const price = professionalService.customPrice || service.basePrice;

        const booking = await prisma.booking.create({
            data: {
                customerId: customer.id,
                professionalId: professional.id,
                serviceId: service.id,
                scheduledAt: slot.startAt,
                scheduledEndAt : slot.endAt,
                addressId: customerAddress.id,
                price: price,
                status: ['COMPLETED', 'CONFIRMED', 'PENDING'][Math.floor(Math.random() * 3)],
                paymentStatus: 'PAID',
                idempotencyKey: `booking_${Date.now()}_${i}`
            }
        });

        // Update slot status
        await prisma.slot.update({
            where: { id: slot.id },
            data: { state: 'BOOKED' }
        });

        // Create review for completed bookings
        if (booking.status === 'COMPLETED' && Math.random() > 0.3) {
            await prisma.review.create({
                data: {
                    bookingId: booking.id,
                    customerId: customer.id,
                    professionalId: professional.id,
                    rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
                    comment: [
                        'Great service! Very professional and on time.',
                        'Excellent work quality. Highly recommended.',
                        'Good service, will book again.',
                        'Professional and courteous. Job well done.',
                        'Very satisfied with the service quality.'
                    ][Math.floor(Math.random() * 5)]
                }
            });
        }

        // Remove this slot from available slots
        const slotIndex = allSlots.findIndex(s => s.id === slot.id);
        if (slotIndex > -1) {
            allSlots.splice(slotIndex, 1);
        }
    }

    // 11. Create Price Rules
    console.log(" Creating price rules...")

    const samplePriceRules = [
        {
            type: "PERCENTAGE",
            value: 10,
            condition: { dayOfWeek: [0, 6] }, // Weekend surcharge
            isActive: true,
        },
        {
            type: "PERCENTAGE",
            value: -15,
            condition: { timeOfDay: "morning" }, // Morning discount
            isActive: true,
        },
        {
            type: "FLAT",
            value: 100,
            condition: { distanceKm: ">15" }, // Distance charge
            isActive: true,
        },
    ]

    for (let rule of samplePriceRules) {
        await prisma.priceRule.create({
            data: {
                type: rule.type,
                value: rule.value,
                condition: rule.condition,
                isActive: rule.isActive,
                // attach to a service or professional if you want
                // serviceId: someService.id,
                // professionalId: someProfessional.id,
            },
        })
    }
}

main()
    .catch((e) => {
        console.error("❌ Seeding error:", e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })