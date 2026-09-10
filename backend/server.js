import "dotenv/config";
import app from "./src/app.js";
import http from "http";
import connectDB from "./src/config/database.js";
import { initSocket } from "./src/sockets/server.socket.js";

const port = process.env.PORT || 3000;
connectDB();

const httpServer = http.createServer(app);
initSocket(httpServer);

httpServer.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});