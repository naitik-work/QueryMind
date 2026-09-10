import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        chat: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Chat",
            required: [true, "Message chat is required"]
        },
        content: {
            type: String,
            required: [true, "Message context is required"],
            trim: true
        },
        role: {
            type: String,
            enum: {
                values: ["user", "ai"],
                message: "Role must be either user or ai"
            },
            required: [true, "Message role is required"]
        }
    },
    {
        timestamps: true
    }
);

const messageModel = mongoose.model("Message", messageSchema);

export default messageModel;
