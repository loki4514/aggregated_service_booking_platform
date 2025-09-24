import winston from "winston";
import dotenv from "dotenv";
import { LOG_LEVEL } from "./constants.js";


// Pick log level from .env (default: "info")
const logLevel = LOG_LEVEL.toLowerCase() || "info";

const logger = winston.createLogger({
    level: logLevel,
    format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.printf(({ timestamp, level, message, stack }) => {
            return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
        })
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: "app.log" })
    ]
});

export default logger;
