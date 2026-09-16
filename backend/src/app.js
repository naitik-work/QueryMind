import cookieParser from "cookie-parser";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import authRouter from "./routes/auth.routes.js";
import chatRouter from "./routes/chat.routes.js";
import memoryRouter from "./routes/memory.routes.js";

const app = express();

const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

app.use(cors({
    origin: [
        frontendUrl,
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));


app.get("/", (req, res) => {
    res.json({
        name: "Nova-Search API",
        version: "2.0.0",
        status: "operational"
    });
});

app.use("/api/auth", authRouter);
app.use("/api/chats", chatRouter);
app.use("/api/chat", chatRouter); // Support singular alias
app.use("/api", memoryRouter);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("[ERROR] Global handler:", err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal server error",
        err: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
});

export default app;
