import "dotenv/config";
import app from "./src/app.js";
import connectDB from "./src/config/database.js";
import "./src/services/mail.service.js";
import { testAi } from "./src/services/ai.service.js";
const PORT = process.env.PORT || 8000;

connectDB()
    .catch((err) => {
        console.error("MongoDB connection failed:", err);
        process.exit(1);
    });

//this is just to test the AI model.
testAi();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});