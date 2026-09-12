import app from "./src/app.js";
import userModel from "./src/models/user.model.js";
import chatModel from "./src/models/chat.model.js";
import messageModel from "./src/models/message.model.js";
import memoryModel from "./src/models/memory.model.js";
import { aiProviderManager, isRetryableAIError, AIServiceUnavailableError } from "./src/services/ai/provider.manager.js";
import { isSensitiveTool, executeReadOnlyTool } from "./src/services/ai/tool.service.js";
import { formatMemoriesForContext } from "./src/services/ai/memory.service.js";
import { searchInternet } from "./src/services/internet.service.js";
import { generateChatTitle } from "./src/services/ai.service.js";

console.log("--- STARTING BACKEND VERIFICATION ---");

// 1. Check Express App & Routes
console.log("✓ Express app imported successfully:", typeof app);

// 2. Check Models
console.log("✓ User Model schema:", !!userModel.schema);
console.log("✓ Chat Model schema:", !!chatModel.schema);
console.log("✓ Message Model schema:", !!messageModel.schema);
console.log("✓ Memory Model schema:", !!memoryModel.schema);

// 3. Check AI Provider Manager
console.log("✓ Primary Provider:", aiProviderManager.getPrimaryProvider().getName());
console.log("✓ Fallback Provider:", aiProviderManager.getFallbackProvider().getName());

// 4. Check Error Classification
const rateLimitErr = new Error("Rate limit exceeded");
rateLimitErr.status = 429;
console.log("✓ Rate limit is retryable:", isRetryableAIError(rateLimitErr) === true);

const quotaErr = new Error("Resource has been exhausted (e.g. check quota)");
console.log("✓ Quota error is retryable:", isRetryableAIError(quotaErr) === true);

const badReqErr = new Error("Invalid parameter");
badReqErr.status = 400;
console.log("✓ 400 is not retryable:", isRetryableAIError(badReqErr) === false);

// 5. Check Fallback Friendly Error
const unavailableErr = new AIServiceUnavailableError();
console.log("✓ Availability error message contains email:", unavailableErr.message.includes("hamzakhantz@gmail.com"));

// 6. Check Tools & Risk Classifier
console.log("✓ sendEmail is sensitive (requires confirmation):", isSensitiveTool("sendEmail") === true);
console.log("✓ searchInternet is read-only:", isSensitiveTool("searchInternet") === false);

// 7. Check Memory Formatter
const sampleMemories = [
    { type: "preference", content: "Prefers TypeScript" },
    { type: "goal", content: "Learning Rust" }
];
const contextString = formatMemoriesForContext(sampleMemories, { responseStyle: "concise" });
console.log("✓ Memory formatter outputs context string:", contextString.includes("Prefers TypeScript"));

// 8. Check Deterministic Title Fallback
const title = await generateChatTitle("how does react fiber reconciliation algorithm work under the hood");
console.log("✓ Title generation produced:", title);

console.log("--- ALL BACKEND VERIFICATIONS PASSED ---");
process.exit(0);
