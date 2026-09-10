import "dotenv/config";
import app from "./src/app.js";
import connectDB from "./src/config/database.js";
import { testAi } from "./src/services/ai.service.js";


const port = process.env.PORT || 3000;
connectDB();
// testAi();

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});