import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, "Username is required"],
            unique: true,
            trim: true,
            minlength: [3, "Username must be at least 3 characters long"],
            maxlength: [30, "Username cannot exceed 30 characters"]
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"]
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            // minlength: [8, "Password must be at least 8 characters long"],
            select: false
        },
            verified: {
            type: Boolean,
            default: false
        },
        preferences: {
            personalizationEnabled: {
                type: Boolean,
                default: true
            },
            responseStyle: {
                type: String,
                enum: ["concise", "balanced", "detailed"],
                default: "balanced"
            },
            technicalLevel: {
                type: String,
                enum: ["beginner", "intermediate", "advanced"],
                default: "intermediate"
            },
            preferredLanguage: {
                type: String,
                default: "en"
            },
            preferredName: {
                type: String,
                trim: true,
                default: ""
            }
        }
    },
    {
        timestamps: true
    }
);


userSchema.pre("save", async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const userModel = mongoose.model("User", userSchema);

export default userModel;
