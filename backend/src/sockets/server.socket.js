import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";
import userModel from "../models/user.model.js";
import memoryModel from "../models/memory.model.js";
import { generateChatTitle, streamResponse } from "../services/ai.service.js";
import { executeBattleService } from "../services/battle.service.js";
import { isEmailDraftRequest, parseEmailDraftDetails } from "../services/ai/gemini.provider.js";
import { executeConfirmedTool } from "../services/ai/tool.service.js";
import { detectAndStoreDurableMemory } from "../services/ai/memory.service.js";

let io;
const activeStreams = new Map(); // socketId -> AbortController
const pendingActions = new Map(); // actionId -> { socketId, userId, tool, parameters, chatId }

function parseCookies(cookieHeader = "") {
    const cookies = {};
    cookieHeader.split(";").forEach(item => {
        const parts = item.split("=");
        const name = parts[0]?.trim();
        if (!name) return;
        const value = parts.slice(1).join("=").trim();
        cookies[name] = decodeURIComponent(value);
    });
    return cookies;
}

export function initSocket(httpServer) {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    io = new Server(httpServer, {
        cors: {
            origin: [frontendUrl, "http://localhost:5173", "http://127.0.0.1:5173"],
            credentials: true,
            methods: ["GET", "POST"]
        }
    });

    console.log("[SOCKET] Socket.IO Server initialized with CORS");

    // Authentication Middleware
    io.use((socket, next) => {
        try {
            const cookieHeader = socket.handshake.headers.cookie || "";
            const cookies = parseCookies(cookieHeader);
            const token = cookies.token || socket.handshake.auth?.token;

            if (!token) {
                return next(new Error("Authentication token required"));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = decoded;
            next();
        } catch (err) {
            console.warn("[SOCKET] Authentication failed:", err.message);
            next(new Error("Unauthorized socket connection"));
        }
    });

    io.on("connection", socket => {
        const userId = socket.user?.id;
        console.log(`[SOCKET] User connected: ${socket.user?.username} (${socket.id})`);
        socket.join(userId);

        /**
         * Handle incoming chat message with real-time streaming
         */
        socket.on("chat:send", async data => {
            const { message, chatId, battleMode } = data || {};

            if (!message || !message.trim()) {
                socket.emit("chat:error", { message: "Message content cannot be empty" });
                return;
            }

            let currentChatId = chatId;
            let currentChat = null;

            try {
                // 1. Create chat if this is the first message
                if (!currentChatId) {
                    let title = "New conversation";
                    try {
                        title = await generateChatTitle(message);
                    } catch (tErr) {
                        const words = message.trim().split(/\s+/).slice(0, 5).join(" ");
                        title = words.charAt(0).toUpperCase() + words.slice(1);
                    }

                    currentChat = await chatModel.create({
                        user: userId,
                        title
                    });
                    currentChatId = currentChat._id.toString();

                    socket.emit("chat:created", {
                        chat: {
                            id: currentChat._id,
                            title: currentChat.title,
                            updatedAt: currentChat.updatedAt
                        }
                    });
                } else {
                    currentChat = await chatModel.findOne({ _id: currentChatId, user: userId });
                    if (!currentChat) {
                        socket.emit("chat:error", { message: "Chat conversation not found" });
                        return;
                    }
                }

                // 2. Persist User Message
                const userMessage = await messageModel.create({
                    chat: currentChatId,
                    content: message.trim(),
                    role: "user"
                });

                socket.emit("chat:message_saved", {
                    chatId: currentChatId,
                    message: {
                        id: userMessage._id,
                        content: userMessage.content,
                        role: "user",
                        createdAt: userMessage.createdAt
                    }
                });

                if (battleMode) {
                    socket.emit("chat:status", {
                        chatId: currentChatId,
                        status: "generating",
                        label: "Generating two responses in parallel..."
                    });

                    const battleResult = await executeBattleService({
                        query: message.trim(),
                        onStatus: (statusObj) => {
                            socket.emit("chat:status", {
                                chatId: currentChatId,
                                status: statusObj.status,
                                label: statusObj.label
                            });
                        }
                    });

                    const aiMessage = await messageModel.create({
                        chat: currentChatId,
                        content: battleResult.content,
                        role: "ai",
                        metadata: {
                            sources: [],
                            model: "battle-arena",
                            provider: "langgraph",
                            stopped: false,
                            battle: {
                                isBattle: true,
                                response1: battleResult.response1,
                                response2: battleResult.response2,
                                judge: battleResult.judge
                            }
                        }
                    });

                    await chatModel.findByIdAndUpdate(currentChatId, { updatedAt: new Date() });

                    socket.emit("chat:done", {
                        chatId: currentChatId,
                        message: {
                            id: aiMessage._id,
                            content: aiMessage.content,
                            role: "ai",
                            metadata: aiMessage.metadata,
                            createdAt: aiMessage.createdAt
                        }
                    });

                    // Background durable memory detection
                    detectAndStoreDurableMemory({ userId, message }).catch(() => {});
                    return;
                }

                // 3. Load Context & Memory
                socket.emit("chat:status", {
                    chatId: currentChatId,
                    status: "thinking",
                    label: "Thinking..."
                });

                // 3. Detect and store durable memory early
                await detectAndStoreDurableMemory({ userId, message }).catch(() => {});

                const messageHistory = await messageModel
                    .find({ chat: currentChatId })
                    .sort({ createdAt: 1 })
                    .limit(25);

                const userDoc = await userModel.findById(userId).select("username preferences");
                let memories = [];
                if (userDoc?.preferences?.personalizationEnabled !== false) {
                    memories = await memoryModel
                        .find({ user: userId })
                        .sort({ importance: -1, createdAt: -1 })
                        .limit(15);
                }

                // Check for email drafting intent
                let emailAgentContext = "";
                if (isEmailDraftRequest(message)) {
                    const draftDetails = parseEmailDraftDetails(message);
                    const actionId = `action_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

                    pendingActions.set(actionId, {
                        socketId: socket.id,
                        userId,
                        tool: "sendEmail",
                        parameters: draftDetails,
                        chatId: currentChatId
                    });

                    socket.emit("chat:action_required", {
                        actionId,
                        chatId: currentChatId,
                        tool: "sendEmail",
                        details: draftDetails
                    });

                    emailAgentContext = `[EMAIL AGENT DIRECTIVE]: The user wants to compose or send an email/mail. QueryMind's interactive Email Action Card has ALREADY been generated and displayed directly above in the UI with recipient: "${draftDetails.to || "(to be confirmed)"}", subject: "${draftDetails.subject}", and the drafted content. DO NOT state that you cannot send emails or lack email access. DO NOT provide nodemailer scripts or local code. Simply inform the user that their email draft is ready above for review and instruct them to click "Confirm & Send Email" to send it.`;
                }

                // 4. Stream AI Response
                const abortController = new AbortController();
                activeStreams.set(socket.id, abortController);

                let accumulatedText = "";
                let accumulatedSources = [];
                let usedModel = "default";
                let usedProvider = "gemini";

                const stream = streamResponse({
                    messages: messageHistory,
                    preferences: userDoc?.preferences,
                    memories,
                    extraContext: emailAgentContext,
                    onStatus: statusObj => {
                        socket.emit("chat:status", {
                            chatId: currentChatId,
                            status: statusObj.status,
                            label: statusObj.label
                        });
                    },
                    signal: abortController.signal
                });

                for await (const event of stream) {
                    if (abortController.signal.aborted) break;

                    if (event.type === "sources") {
                        accumulatedSources = event.sources || [];
                        socket.emit("chat:sources", {
                            chatId: currentChatId,
                            sources: accumulatedSources
                        });
                    } else if (event.type === "chunk") {
                        accumulatedText += event.text;
                        usedProvider = event.provider || usedProvider;
                        socket.emit("chat:chunk", {
                            chatId: currentChatId,
                            chunk: event.text
                        });
                    }
                }

                activeStreams.delete(socket.id);

                if (!abortController.signal.aborted) {
                    const finalContent = accumulatedText.trim();
                    if (!finalContent) {
                        throw new Error(
                            "QueryMind was unable to generate a valid response. Please retry your question or contact support at hamzakhantz@gmail.com."
                        );
                    }

                    // 5. Persist final completed AI message to DB
                    const aiMessage = await messageModel.create({
                        chat: currentChatId,
                        content: finalContent,
                        role: "ai",
                        metadata: {
                            sources: accumulatedSources,
                            model: usedModel,
                            provider: usedProvider,
                            stopped: false
                        }
                    });

                    await chatModel.findByIdAndUpdate(currentChatId, { updatedAt: new Date() });

                    socket.emit("chat:done", {
                        chatId: currentChatId,
                        message: {
                            id: aiMessage._id,
                            content: aiMessage.content,
                            role: "ai",
                            metadata: aiMessage.metadata,
                            createdAt: aiMessage.createdAt
                        }
                    });

                    // 6. Background durable memory detection
                    detectAndStoreDurableMemory({ userId, message }).catch(() => {});
                }
            } catch (err) {
                activeStreams.delete(socket.id);
                console.error("[SOCKET] Streaming error:", err);

                socket.emit("chat:error", {
                    chatId: currentChatId,
                    message:
                        err.message ||
                        "QueryMind is temporarily unable to generate a response because the available AI models have reached their usage limit. Please try again later. If the issue continues, contact the developer at hamzakhantz@gmail.com.",
                    code: err.code || "STREAM_ERROR"
                });
            }
        });

        /**
         * Stop generation
         */
        socket.on("chat:stop", async data => {
            const { chatId, partialContent } = data || {};
            const controller = activeStreams.get(socket.id);

            if (controller) {
                controller.abort();
                activeStreams.delete(socket.id);
            }

            if (chatId && partialContent && partialContent.trim()) {
                try {
                    const stoppedMessage = await messageModel.create({
                        chat: chatId,
                        content: partialContent.trim(),
                        role: "ai",
                        metadata: { stopped: true }
                    });

                    socket.emit("chat:stopped", {
                        chatId,
                        message: {
                            id: stoppedMessage._id,
                            content: stoppedMessage.content,
                            role: "ai",
                            metadata: stoppedMessage.metadata,
                            createdAt: stoppedMessage.createdAt
                        }
                    });
                } catch (e) {
                    console.warn("[SOCKET] Could not save stopped message:", e.message);
                }
            } else {
                socket.emit("chat:stopped", { chatId });
            }
        });

        /**
         * Confirm or reject sensitive tool execution (e.g. sendEmail)
         */
        socket.on("action:confirm", async data => {
            const { actionId, approved, parameters } = data || {};
            const action = pendingActions.get(actionId);

            if (!action || action.userId !== userId) {
                socket.emit("action:error", { message: "Action not found or expired" });
                return;
            }

            pendingActions.delete(actionId);

            if (!approved) {
                socket.emit("action:cancelled", { actionId, chatId: action.chatId });
                return;
            }

            try {
                socket.emit("chat:status", {
                    chatId: action.chatId,
                    status: "sending",
                    label: "Sending email..."
                });

                const finalParams = parameters || action.parameters;
                const result = await executeConfirmedTool(action.tool, finalParams);

                const confirmationText = `I have sent the email to **${finalParams.to}** with the subject: "${finalParams.subject}".`;

                const aiMessage = await messageModel.create({
                    chat: action.chatId,
                    content: confirmationText,
                    role: "ai",
                    metadata: {
                        toolCalls: [
                            {
                                tool: action.tool,
                                parameters: finalParams,
                                result
                            }
                        ]
                    }
                });

                socket.emit("action:completed", {
                    actionId,
                    chatId: action.chatId,
                    message: {
                        id: aiMessage._id,
                        content: aiMessage.content,
                        role: "ai",
                        createdAt: aiMessage.createdAt
                    }
                });
            } catch (toolErr) {
                console.error("[SOCKET] Tool confirmation error:", toolErr);
                socket.emit("action:error", {
                    actionId,
                    chatId: action.chatId,
                    message: toolErr.message || "Failed to execute tool"
                });
            }
        });

        socket.on("disconnect", () => {
            const controller = activeStreams.get(socket.id);
            if (controller) {
                controller.abort();
                activeStreams.delete(socket.id);
            }
            console.log(`[SOCKET] User disconnected: ${socket.id}`);
        });
    });
}

export function getIO() {
    if (!io) {
        throw new Error("Socket.io not initialized");
    }
    return io;
}