import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Chat user is required"]
        },
        title: {
            type: String,
            required: [true, "Chat title is required"],
            trim: true,
            maxlength: [200, "Chat title cannot exceed 200 characters"]
        }
    },
    {
        timestamps: true
    }
);

const chatModel = mongoose.model("Chat", chatSchema);

export default chatModel;
