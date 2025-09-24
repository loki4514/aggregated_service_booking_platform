# 🛠 Aggregated Service Booking Platform

A **production-ready REST API** for an Urban Company–like service booking platform.
Built with **Node.js (Express), Prisma ORM, PostgreSQL, and JWT Authentication**.

---

##  Features

### Users & Auth

* Customer & Professional signup/login
* JWT-based authentication
* Role-based access control (RBAC: `CUSTOMER`, `PROFESSIONAL`, `ADMIN`)

### Catalog

* Categories & Services
* Add-ons for services
* Search services

### Professionals

* Professional profile management
* Availability slots
* Nearby professional search (Haversine formula)

### Bookings

* Create bookings with services/add-ons
* Concurrency-safe slot locking
* Booking states: `PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED`
* Estimate booking cost
* View bookings (customer & professional)

### Reviews

* Customers can leave reviews after completed bookings
* Professionals can view received reviews

### Addresses

* Customer addresses with geolocation
* Default address support

### Non-Functional

* Input validation with Joi
* Prisma migrations & seed data
* Jest + Supertest integration tests
* Logging with Winston/Morgan
* Rate limiting, Helmet, CORS

---

##  Tech Stack

* **Runtime**: Node.js (LTS)
* **Framework**: Express.js
* **Database**: PostgreSQL
* **ORM**: Prisma
* **Auth**: JWT
* **Validation**: Joi
* **Testing**: Jest + Supertest
* **Docs**: OpenAPI 3.0 (Swagger UI)

---

##  Architecture

```
aggregated_service_booking_platform/
├── prisma/              # Prisma schema, migrations, seeders
├── src/
│   ├── config/          # Env config, logger, constants
│   ├── middleware/      # Auth, validation, error handling
│   ├── routes/          # Express route definitions
│   ├── controllers/     # Handle request/response
│   ├── services/        # Business logic
│   ├── repository/      # DB access with Prisma
│   ├── errors/          # Customer Error handlers
│   └── utils/           # Helpers (hashing, JWT, pagination, etc.)
|   |__ validators
├── tests/               # Jest + Supertest integration tests
├── docs/
│   └── openapi.yaml     # OpenAPI spec
├── .env.example         # Example environment variables
├── README.md            # Project documentation
├── package.json
└── server.js
```

---

##  Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/<your-username>/aggregated_service_booking_platform.git
cd aggregated_service_booking_platform
npm install
```

### 2. Environment Variables

Create a `.env` file (see `.env.example`):

```ini
DATABASE_URL="postgresql://user:password@localhost:5432/booking"
JWT_SECRET="your_jwt_secret"
PORT=5000
```

### 3. Database Setup

Run Prisma migrations:

```bash
npx prisma migrate dev
```

Generate Prisma client:

```bash
npx prisma generate
```

Seed the database:

```bash
npm run seed
```

### 4. Start the Server

```bash
npm run dev   # development (nodemon)
npm start     # production
```

Server runs at  **[http://localhost:5000](http://localhost:5000)**

---

##  Running Tests

Before running tests, set Node.js experimental module flag:

```powershell
$env:NODE_OPTIONS="--experimental-vm-modules"
```

Run integration tests with Jest + Supertest:

```bash
npm test
```

---

##  API Documentation

* API docs are defined in **`docs/openapi.yaml`**
* Swagger UI is served at  **[http://localhost:5000/docs](http://localhost:5000/docs)**

For quick reference, see `curl` examples in the docs folder.

---

## ✅ Example Workflow

1. Customer signs up & logs in
2. Browse services (`/services`, `/services/search`)
3. Get professionals by service or nearby
4. Create booking → confirm/cancel
5. Leave review after completion

---

## 📝 License

MIT License © 2025

