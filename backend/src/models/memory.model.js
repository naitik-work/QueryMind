import mongoose from "mongoose";

const memorySchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Memory user is required"],
            index: true
        },
        type: {
            type: String,
            enum: {
                values: ["preference", "profile", "interest", "goal", "fact", "instruction"],
                message: "{VALUE} is not a valid memory type"
            },
            default: "preference"
        },
        content: {
            type: String,
            required: [true, "Memory content is required"],
            trim: true,
            maxlength: [1000, "Memory content cannot exceed 1000 characters"]
        },
        importance: {
            type: Number,
            default: 3,
            min: 1,
            max: 5
        },
        source: {
            type: String,
            default: "conversation",
            trim: true
        }
    },
    {
        timestamps: true
    }
);

memorySchema.index({ user: 1, importance: -1, createdAt: -1 });

const memoryModel = mongoose.model("Memory", memorySchema);

export default memoryModel;
