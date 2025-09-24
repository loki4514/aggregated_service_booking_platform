# Aggregated Service Booking Platform

A **production-ready REST API** for an Urban Company–like service booking platform.
Built with **Node.js (Express), Prisma ORM, PostgreSQL, and JWT Authentication**.

---

## Features

### Users & Authentication
* Customer & Professional signup/login
* JWT-based authentication with refresh tokens
* Role-based access control (RBAC: `CUSTOMER`, `PROFESSIONAL`, `ADMIN`)
* User profile management

### Service Catalog
* Categories & Services management
* Service add-ons with pricing
* Advanced service search with filters
* Service availability by location

### Professional Management
* Professional profile & portfolio
* Availability slot management
* Skills & certification tracking
* Nearby professional search using Haversine formula
* Professional ratings & reviews

### Smart Booking System
* **Booking Creation**: Customers create bookings with services/add-ons
* **Price Estimation**: Get cost estimates before booking
* **Concurrency-Safe**: Slot locking prevents double bookings
* **Multi-State Workflow**: Complete booking lifecycle management

#### Booking Workflow & States

```
PENDING → CONFIRMED → COMPLETED
   ↓         ↓           ↓
CANCELLED  CANCELLED    REVIEW
```

**Booking States:**
- **`PENDING`** - Initial state after customer creates booking
- **`CONFIRMED`** - Professional accepts the booking
- **`CANCELLED`** - Booking cancelled by customer or professional
- **`COMPLETED`** - Service delivered successfully

**Business Rules:**
- **Customer Cancellation**: Can cancel within **3 hours** of booking creation using dedicated cancel endpoint
- **Professional Status Management**: Only professionals can update booking status (confirm, complete, cancel)
- **Review System**: Customers can leave reviews only after booking completion
- **Slot Protection**: Confirmed bookings lock time slots to prevent conflicts

### Review System
* Customers leave reviews after completed bookings
* Rating system (1-5 stars) with comments
* Professional review analytics
* Review moderation capabilities

### Address Management
* Customer addresses with precise geolocation
* Default address support
* Service area validation
* Distance-based professional matching

### Production Features
* **Security**: Input validation (Joi), rate limiting, CORS, Helmet
* **Reliability**: Error handling, logging (Winston/Morgan)
* **Testing**: Comprehensive Jest + Supertest integration tests
* **Documentation**: OpenAPI 3.0 with Swagger UI
* **Database**: Prisma migrations with seed data

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Runtime** | Node.js (LTS) |
| **Framework** | Express.js |
| **Database** | PostgreSQL |
| **ORM** | Prisma |
| **Authentication** | JWT |
| **Validation** | Joi |
| **Testing** | Jest + Supertest |
| **Documentation** | OpenAPI 3.0/Swagger |
| **Logging** | Winston + Morgan |

---

## Project Architecture

```
aggregated_service_booking_platform/
├── prisma/              # Database schema, migrations & seeders
│   ├── migrations/      # Database migration files
│   ├── schema.prisma    # Database schema definition
│   └── seed.js          # Sample data seeder
├── src/
│   ├── config/          # Environment config, logger, constants
│   ├── middleware/      # Auth, validation, error handling
│   ├── routes/          # Express route definitions
│   ├── controllers/     # Request/response handlers
│   ├── services/        # Business logic layer
│   ├── repository/      # Database access with Prisma
│   ├── errors/          # Custom error handlers
│   ├── utils/           # Helpers (hashing, JWT, pagination)
│   └── validators/      # Joi validation schemas
├── tests/               # Integration tests
│   ├── helpers/         # Test utilities
│   └── *.test.js        # Test suites
├── docs/
│   └── openapi.yaml     # API specification
├── .env.example         # Environment variables template
└── server.js            # Application entry point
```

---

## Getting Started

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/loki4514/aggregated_service_booking_platform.git
cd aggregated_service_booking_platform
npm install
```

### 2. Environment Configuration

Create `.env` file from template:

```bash
cp .env.example .env
```

Update with your configuration:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/booking_platform"

# Authentication
JWT_SECRET="your_super_secure_jwt_secret_key"
JWT_EXPIRES_IN="24h"

# Server
PORT=5000
NODE_ENV="development"


```

### 3. Database Setup

**Run migrations:**
```bash
npx prisma migrate dev --name init
```

**Generate Prisma client:**
```bash
npx prisma generate
```

**Seed sample data:**
```bash
npm run seed
```

**View database (optional):**
```bash
npx prisma studio
```

### 4. Start Development Server

```bash
npm run dev     # Development with nodemon
npm start       # Production mode
```

**Server:** [http://localhost:5000](http://localhost:5000)  
**API Docs:** [http://localhost:5000/docs](http://localhost:5000/docs)

---

## Testing

### Setup Test Environment

**Enable experimental modules:**
```powershell
# PowerShell
$env:NODE_OPTIONS="--experimental-vm-modules"

# Bash/Zsh
export NODE_OPTIONS="--experimental-vm-modules"
```

**Ensure database is seeded:**
```bash
npm run seed
```

### Run Tests

```bash
npm test              # All tests
npm run test:watch    # Watch mode
npm run test:coverage # With coverage report
```

**Test Structure:**
- **Integration Tests**: Complete API workflow testing
- **Authentication Tests**: Login, signup, JWT validation
- **Booking Tests**: Full booking lifecycle
- **Review Tests**: Review creation and retrieval

---

## API Documentation

* **OpenAPI Spec**: `docs/openapi.yaml`
* **Interactive Docs**: [http://localhost:5000/docs](http://localhost:5000/docs)
* **Postman Collection**: Available in `docs/` folder

---

## Complete Booking Workflow

### 1. Customer Journey

#### Browse Services
```bash
curl --location 'http://localhost:5000/api/v1/services?page=1&limit=20' \
--header 'Authorization: Bearer YOUR_TOKEN'
```

#### Find Nearby Professionals
```bash
curl --location 'http://localhost:5000/api/v1/pro/nearby?serviceId=SERVICE_ID&addressId=ADDRESS_ID' \
--header 'Authorization: Bearer YOUR_TOKEN'
```

#### Get Price Estimate
```bash
curl --location 'http://localhost:5000/api/v1/bookings/estimate' \
--header 'Authorization: Bearer YOUR_TOKEN' \
--header 'Content-Type: application/json' \
--data '{
    "professionalId": "PROFESSIONAL_ID",
    "serviceId": "SERVICE_ID",
    "addonIds": ["ADDON_ID_1", "ADDON_ID_2"]
}'
```

#### Create Booking
```bash
curl --location 'http://localhost:5000/api/v1/bookings/create-booking' \
--header 'Authorization: Bearer YOUR_TOKEN' \
--header 'Content-Type: application/json' \
--data '{
    "professionalId": "PROFESSIONAL_ID",
    "serviceId": "SERVICE_ID",
    "addonIds": ["ADDON_ID_1", "ADDON_ID_2"],
    "slotId": "SLOT_ID",
    "addressId": "ADDRESS_ID",
    "notes": "Please ring the doorbell"
}'
```

#### View My Bookings
```bash
# Get all bookings
curl --location 'http://localhost:5000/api/v1/bookings/my-bookings' \
--header 'Authorization: Bearer YOUR_TOKEN'

# Filter by status (pending, confirmed, completed, cancelled)
curl --location 'http://localhost:5000/api/v1/bookings/my-bookings?status=pending' \
--header 'Authorization: Bearer YOUR_TOKEN'

curl --location 'http://localhost:5000/api/v1/bookings/my-bookings?status=completed' \
--header 'Authorization: Bearer YOUR_TOKEN'
```

#### Cancel Booking (within 3 hours)
```bash
curl --location -X PUT 'http://localhost:5000/api/v1/bookings/BOOKING_ID/cancel' \
--header 'Authorization: Bearer YOUR_TOKEN'
```

#### Leave Review (after completion)
```bash
curl --location 'http://localhost:5000/api/v1/reviews/create-review' \
--header 'Authorization: Bearer YOUR_TOKEN' \
--header 'Content-Type: application/json' \
--data '{
    "bookingId": "BOOKING_ID",
    "rating": 5,
    "comment": "Excellent service!"
}'
```

#### View My Reviews
```bash
curl --location 'http://localhost:5000/api/v1/reviews/me' \
--header 'Authorization: Bearer YOUR_TOKEN'
```

### 2. Professional Journey

#### View Professional Bookings
```bash
# All professional bookings
curl --location 'http://localhost:5000/api/v1/bookings/professional-bookings' \
--header 'Authorization: Bearer YOUR_PROFESSIONAL_TOKEN'

# Filter by status
curl --location 'http://localhost:5000/api/v1/bookings/professional-bookings?status=pending' \
--header 'Authorization: Bearer YOUR_PROFESSIONAL_TOKEN'
```

#### Update Booking Status (Professional Only)
```bash
# Accept booking (pending → confirmed)
curl --location --request PATCH 'http://localhost:5000/api/v1/bookings/BOOKING_ID/status' \
--header 'Authorization: Bearer YOUR_PROFESSIONAL_TOKEN' \
--header 'Content-Type: application/json' \
--data '{
    "status": "confirmed"
}'

# Complete booking (confirmed → completed)
curl --location --request PATCH 'http://localhost:5000/api/v1/bookings/BOOKING_ID/status' \
--header 'Authorization: Bearer YOUR_PROFESSIONAL_TOKEN' \
--header 'Content-Type: application/json' \
--data '{
    "status": "completed"
}'

# Cancel booking with reason
curl --location --request PATCH 'http://localhost:5000/api/v1/bookings/BOOKING_ID/status' \
--header 'Authorization: Bearer YOUR_PROFESSIONAL_TOKEN' \
--header 'Content-Type: application/json' \
--data '{
    "status": "cancelled",
    "cancellationReason": "delayed"
}'
```

#### View Received Reviews
```bash
curl --location 'http://localhost:5000/api/v1/reviews/PROFESSIONAL_ID' \
--header 'Authorization: Bearer YOUR_PROFESSIONAL_TOKEN'
```

---

## API Endpoints Summary

### Authentication
- `POST /api/v1/auth/signup` - User registration
- `POST /api/v1/auth/login` - User login

### Services
- `GET /api/v1/services` - List services (supports pagination: `?page=1&limit=20`)
- `GET /api/v1/services/search` - Search services

### Professionals
- `GET /api/v1/pro/nearby` - Find nearby professionals by service and address

### Bookings
- `POST /api/v1/bookings/estimate` - Get price estimate
- `POST /api/v1/bookings/create-booking` - Create new booking
- `GET /api/v1/bookings/my-bookings` - Customer bookings (supports status filter)
- `GET /api/v1/bookings/professional-bookings` - Professional bookings (supports status filter)
- `PATCH /api/v1/bookings/:id/status` - **Professional only** - Update booking status (confirmed, completed, cancelled)
- `PUT /api/v1/bookings/:id/cancel` - **Customer only** - Cancel booking (within 3 hours)

### Reviews
- `POST /api/v1/reviews/create-review` - Create review after completed booking
- `GET /api/v1/reviews/me` - Customer's written reviews
- `GET /api/v1/reviews/:professionalId` - Reviews for a professional

---

## Security Features

- **JWT Authentication** with secure token handling
- **Rate Limiting** to prevent abuse
- **Input Validation** using Joi schemas  
- **CORS** configuration for cross-origin requests
- **Helmet** for security headers
- **Password Hashing** using bcrypt
- **SQL Injection Protection** via Prisma ORM

---

## Deployment

### Environment Setup
```bash
# Production environment
NODE_ENV=production
DATABASE_URL="your_production_db_url"
JWT_SECRET="strong_production_secret"
```

### Docker Support (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
EXPOSE 5000
CMD ["npm", "start"]
```
---

## License

MIT License © 2025 - See [LICENSE](LICENSE) for details

---

## Support

- **Documentation**: Check `/docs` folder for detailed guides
- **Issues**: [GitHub Issues](https://github.com/loki4514/aggregated_service_booking_platform/issues)
- **API Reference**: [http://localhost:5000/docs](http://localhost:5000/docs)

---

