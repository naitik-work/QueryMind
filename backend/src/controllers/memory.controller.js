import memoryModel from "../models/memory.model.js";
import userModel from "../models/user.model.js";

export async function getMemories(req, res) {
    try {
        const memories = await memoryModel.find({ user: req.user.id })
            .sort({ importance: -1, createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Memories retrieved successfully",
            memories
        });
    } catch (error) {
        console.error("[MEMORY] Get memories error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve memories",
            err: error.message
        });
    }
}

export async function createMemory(req, res) {
    try {
        const { content, type = "preference", importance = 3, source = "manual" } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({
                success: false,
                message: "Memory content is required"
            });
        }

        const memory = await memoryModel.create({
            user: req.user.id,
            content: content.trim(),
            type,
            importance: Math.min(5, Math.max(1, Number(importance) || 3)),
            source
        });

        return res.status(201).json({
            success: true,
            message: "Memory created successfully",
            memory
        });
    } catch (error) {
        console.error("[MEMORY] Create memory error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create memory",
            err: error.message
        });
    }
}

export async function updateMemory(req, res) {
    try {
        const { id } = req.params;
        const { content, type, importance } = req.body;

        const updateData = {};
        if (content !== undefined) updateData.content = content.trim();
        if (type !== undefined) updateData.type = type;
        if (importance !== undefined) updateData.importance = Math.min(5, Math.max(1, Number(importance) || 3));

        const memory = await memoryModel.findOneAndUpdate(
            { _id: id, user: req.user.id },
            updateData,
            { new: true }
        );

        if (!memory) {
            return res.status(404).json({
                success: false,
                message: "Memory not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Memory updated successfully",
            memory
        });
    } catch (error) {
        console.error("[MEMORY] Update memory error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update memory",
            err: error.message
        });
    }
}

export async function deleteMemory(req, res) {
    try {
        const { id } = req.params;

        const memory = await memoryModel.findOneAndDelete({
            _id: id,
            user: req.user.id
        });

        if (!memory) {
            return res.status(404).json({
                success: false,
                message: "Memory not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Memory deleted successfully"
        });
    } catch (error) {
        console.error("[MEMORY] Delete memory error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete memory",
            err: error.message
        });
    }
}

export async function getUserPreferences(req, res) {
    try {
        const user = await userModel.findById(req.user.id).select("preferences username email");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            preferences: user.preferences || {
                personalizationEnabled: true,
                responseStyle: "balanced",
                technicalLevel: "intermediate",
                preferredLanguage: "en",
                preferredName: ""
            }
        });
    } catch (error) {
        console.error("[PREFERENCES] Get preferences error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve user preferences",
            err: error.message
        });
    }
}

export async function updateUserPreferences(req, res) {
    try {
        const { personalizationEnabled, responseStyle, technicalLevel, preferredLanguage, preferredName } = req.body;

        const updateFields = {};
        if (personalizationEnabled !== undefined) updateFields["preferences.personalizationEnabled"] = Boolean(personalizationEnabled);
        if (responseStyle !== undefined) updateFields["preferences.responseStyle"] = responseStyle;
        if (technicalLevel !== undefined) updateFields["preferences.technicalLevel"] = technicalLevel;
        if (preferredLanguage !== undefined) updateFields["preferences.preferredLanguage"] = preferredLanguage;
        if (preferredName !== undefined) updateFields["preferences.preferredName"] = preferredName.trim();

        const user = await userModel.findByIdAndUpdate(
            req.user.id,
            { $set: updateFields },
            { new: true }
        ).select("preferences");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Preferences updated successfully",
            preferences: user.preferences
        });
    } catch (error) {
        console.error("[PREFERENCES] Update preferences error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update preferences",
            err: error.message
        });
    }
}
