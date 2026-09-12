import { Router } from "express";
import {
    sendMessage,
    getChats,
    getMessages,
    renameChat,
    deleteChat
} from "../controllers/chat.controller.js";
import { authUser } from "../middlewares/auth.middlewares.js";

const chatRouter = Router();

chatRouter.post("/message", authUser, sendMessage);
chatRouter.get("/", authUser, getChats);
chatRouter.get("/:chatId/messages", authUser, getMessages);
chatRouter.patch("/:chatId", authUser, renameChat);
chatRouter.delete("/:chatId", authUser, deleteChat);
// Backward compatibility for existing delete endpoint
chatRouter.delete("/delete/:chatId", authUser, deleteChat);

export default chatRouter;