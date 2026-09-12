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
            required: [true, "Message content is required"],
            trim: true
        },
        role: {
            type: String,
            enum: {
                values: ["user", "ai"],
                message: "Role must be either user or ai"
            },
            required: [true, "Message role is required"]
        },
        metadata: {
            sources: [
                {
                    title: String,
                    url: String,
                    domain: String,
                    snippet: String
                }
            ],
            toolCalls: [
                {
                    tool: String,
                    parameters: mongoose.Schema.Types.Mixed,
                    result: mongoose.Schema.Types.Mixed
                }
            ],
            model: {
                type: String,
                default: ""
            },
            provider: {
                type: String,
                default: ""
            },
            stopped: {
                type: Boolean,
                default: false
            }
        }
    },
    {
        timestamps: true
    }
);

messageSchema.index({ chat: 1, createdAt: 1 });

const messageModel = mongoose.model("Message", messageSchema);

export default messageModel;
