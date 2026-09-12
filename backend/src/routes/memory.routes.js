import { Router } from "express";
import { authUser } from "../middlewares/auth.middlewares.js";
import {
    getMemories,
    createMemory,
    updateMemory,
    deleteMemory,
    getUserPreferences,
    updateUserPreferences
} from "../controllers/memory.controller.js";

const memoryRouter = Router();

// Memory endpoints
memoryRouter.get("/memory", authUser, getMemories);
memoryRouter.post("/memory", authUser, createMemory);
memoryRouter.patch("/memory/:id", authUser, updateMemory);
memoryRouter.delete("/memory/:id", authUser, deleteMemory);

// User Preferences endpoints
memoryRouter.get("/user/preferences", authUser, getUserPreferences);
memoryRouter.patch("/user/preferences", authUser, updateUserPreferences);

export default memoryRouter;
