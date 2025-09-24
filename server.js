// server.js
import app from "./app.js";
import { PORT } from "./src/config/constants.js";
import logger from "./src/config/logger.js";

app.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`);
});
