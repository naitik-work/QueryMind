import { generateChatTitle, generateResponse } from "../services/ai.service.js";
import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";
import userModel from "../models/user.model.js";
import memoryModel from "../models/memory.model.js";
import { detectAndStoreDurableMemory } from "../services/ai/memory.service.js";

export async function sendMessage(req, res) {
    try {
        const { message, chat: chatId } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: "Message content cannot be empty"
            });
        }

        let title = null;
        let chat = null;

        if (!chatId) {
            try {
                title = await generateChatTitle(message);
            } catch (titleError) {
                console.warn("[CHAT] Title generation fallback:", titleError.message);
                const words = message.trim().split(/\s+/).slice(0, 5).join(" ");
                title = words.charAt(0).toUpperCase() + words.slice(1);
            }

            if (!title || !title.trim()) {
                title = "New conversation";
            }

            chat = await chatModel.create({
                user: req.user.id,
                title: title.trim()
            });
        }

        const currentChatId = chatId || chat._id;

        // Verify chat exists and belongs to user if chatId provided
        if (chatId) {
            chat = await chatModel.findOne({ _id: chatId, user: req.user.id });
            if (!chat) {
                return res.status(404).json({
                    success: false,
                    message: "Chat not found"
                });
            }
        }

        const userMessage = await messageModel.create({
            chat: currentChatId,
            content: message.trim(),
            role: "user"
        });

        // Fetch recent messages for context
        const messageHistory = await messageModel.find({
            chat: currentChatId
        }).sort({ createdAt: 1 }).limit(30);

        // Detect & store durable memory from message
        await detectAndStoreDurableMemory({ userId: req.user.id, message }).catch(() => {});

        // Fetch user preferences & durable memories
        const user = await userModel.findById(req.user.id).select("username preferences");
        let memories = [];
        if (user?.preferences?.personalizationEnabled !== false) {
            memories = await memoryModel.find({ user: req.user.id })
                .sort({ importance: -1, createdAt: -1 })
                .limit(15);
        }

        const aiResult = await generateResponse({
            messages: messageHistory,
            preferences: user?.preferences,
            memories
        });

        const aiMessage = await messageModel.create({
            chat: currentChatId,
            content: typeof aiResult === "string" ? aiResult : aiResult.content,
            role: "ai",
            metadata: {
                sources: aiResult.sources || [],
                toolCalls: aiResult.toolCalls || [],
                model: aiResult.model || "default",
                provider: aiResult.provider || "gemini",
                stopped: false
            }
        });

        // Update chat updatedAt timestamp
        await chatModel.findByIdAndUpdate(currentChatId, { updatedAt: new Date() });

        return res.status(201).json({
            success: true,
            title,
            chat,
            userMessage,
            aiMessage
        });
    } catch (error) {
        console.error("[CHAT] Send message error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to process message",
            err: error.message
        });
    }
}

export async function getChats(req, res) {
    try {
        const chats = await chatModel.find({ user: req.user.id })
            .sort({ updatedAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Chats retrieved successfully",
            chats
        });
    } catch (error) {
        console.error("[CHAT] Get chats error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve chats",
            err: error.message
        });
    }
}

export async function getMessages(req, res) {
    try {
        const { chatId } = req.params;

        const chat = await chatModel.findOne({
            _id: chatId,
            user: req.user.id
        });

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found"
            });
        }

        const messages = await messageModel.find({
            chat: chatId
        }).sort({ createdAt: 1 });

        return res.status(200).json({
            success: true,
            message: "Messages retrieved successfully",
            messages
        });
    } catch (error) {
        console.error("[CHAT] Get messages error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve messages",
            err: error.message
        });
    }
}

export async function renameChat(req, res) {
    try {
        const { chatId } = req.params;
        const { title } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: "Chat title cannot be empty"
            });
        }

        const chat = await chatModel.findOneAndUpdate(
            { _id: chatId, user: req.user.id },
            { title: title.trim() },
            { new: true }
        );

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Chat renamed successfully",
            chat
        });
    } catch (error) {
        console.error("[CHAT] Rename chat error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to rename chat",
            err: error.message
        });
    }
}

export async function deleteChat(req, res) {
    try {
        const { chatId } = req.params;

        const chat = await chatModel.findOneAndDelete({
            _id: chatId,
            user: req.user.id
        });

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found"
            });
        }

        await messageModel.deleteMany({
            chat: chatId
        });

        return res.status(200).json({
            success: true,
            message: "Chat deleted successfully"
        });
    } catch (error) {
        console.error("[CHAT] Delete chat error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete chat",
            err: error.message
        });
    }
}
