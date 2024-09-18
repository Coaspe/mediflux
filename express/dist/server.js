import { createApp } from "./config/express.js";
import { setupSocket } from "./config/socket.js";
import apiRoutes from "./routes/api.js";
import { errorHandler } from "./middleware/errorHandler.js";
import http from "http";
import { PORT } from "shared";
const app = createApp();
const server = http.createServer(app);
setupSocket(server);
app.use("/api", apiRoutes);
app.use(errorHandler);
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
