// app.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import dotenv from "dotenv";
import logger from "./src/config/logger.js";
import routes from "./src/routes/index.js";
import { errorHandler } from "./src/middleware/error.middleware.js";
import { prisma } from "./src/config/database.js";
import { sanitizeRequestBody } from "./src/validators/santizeInput.js";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import { CORS_URLS } from "./src/config/constants.js";


const swaggerDocument = YAML.load("./docs/openapi.yaml");


dotenv.config();

const app = express();
app.use(express.json());
app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin || CORS_URLS.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"]
    })
);

app.use(helmet());
app.use(compression());
app.use(sanitizeRequestBody);

morgan.token("id", (req) => req.user?.userId || "guest");

app.use(morgan(":method :url :status - :response-time ms :id", {
    stream: { write: msg => logger.info(msg.trim()) }
}));

app.use("/api/v1", routes);

app.use(errorHandler);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/", (req, res) => {
    res.json({ message: "Aggregated Service Booking Platform is running!" });
});

app.get("/health", async (req, res) => {
    const health = {
        status: "ok",
        name: "Aggregated Service Booking Platform",
        app: "running",
        database: "postgres",
        timestamp: new Date().toISOString(),
    };

    try {
        await prisma.$queryRaw`SELECT 1`;
        health.database = "connected";
    } catch (err) {
        health.status = "error";
        health.database = "disconnected";
        health.error = err.message;
    }

    res.status(health.status === "ok" ? 200 : 500).json(health);
});

export default app;
