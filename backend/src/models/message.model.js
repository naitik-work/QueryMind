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
            },
            battle: {
                isBattle: {
                    type: Boolean,
                    default: false
                },
                response1: {
                    model: String,
                    provider: String,
                    content: String
                },
                response2: {
                    model: String,
                    provider: String,
                    content: String
                },
                judge: {
                    model: String,
                    provider: String,
                    winner: String,
                    response1Score: Number,
                    response2Score: Number,
                    response1Reasoning: String,
                    response2Reasoning: String,
                    finalReasoning: String
                }
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
