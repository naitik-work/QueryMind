import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";
import { sendEmail } from "../services/mail.service.js";

export async function register(req, res) {
    try {
        const { username, email, password } = req.body;

        const isUserAlreadyExists = await userModel.findOne({
            $or: [
                { email: email.toLowerCase() },
                { username: username.trim() }
            ]
        });

        if (isUserAlreadyExists) {
            return res.status(409).json({
                message: "User with this email or username already exists",
                success: false,
                err: "User already exists"
            });
        }

        const user = await userModel.create({
            username: username.trim(),
            email: email.toLowerCase().trim(),
            password
        });

        const emailVerificationToken = jwt.sign(
            { email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        let requestOrigin = req.headers.origin;
        if (!requestOrigin && req.headers.referer) {
            try {
                requestOrigin = new URL(req.headers.referer).origin;
            } catch (e) {
                // Ignore parse error
            }
        }
        const frontendUrl = requestOrigin || process.env.FRONTEND_URL || "http://localhost:5173";
        const verificationUrl = `${frontendUrl}/verify-email?token=${emailVerificationToken}`;

        let emailSent = true;
        try {
            await sendEmail({
                to: email,
                subject: "Verify your email - Nova-Search",
                html: `
                    <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e4e4e7; border-radius: 12px; background: #fafafa;">
                        <h2 style="color: #09090b; margin-top: 0;">Welcome to Nova-Search!</h2>
                        <p style="color: #3f3f46; font-size: 15px; line-height: 1.5;">Hi ${username},</p>
                        <p style="color: #3f3f46; font-size: 15px; line-height: 1.5;">Thank you for registering with Nova-Search. Please verify your email address to activate your account:</p>
                        <div style="margin: 28px 0;">
                            <a href="${verificationUrl}" style="background: #0ea5e9; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Verify Email</a>
                        </div>
                        <p style="color: #71717a; font-size: 13px; line-height: 1.4;">Or copy and paste this link in your browser:</p>
                        <p style="color: #0ea5e9; font-size: 13px; word-break: break-all;">${verificationUrl}</p>
                        <p style="color: #71717a; font-size: 13px; margin-top: 24px;">If you did not sign up for Nova-Search, please disregard this email.</p>
                        <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 24px 0;" />
                        <p style="color: #a1a1aa; font-size: 12px; margin-bottom: 0;">&copy; ${new Date().getFullYear()} Nova-Search. All rights reserved.</p>
                    </div>
                `,
                text: `Hi ${username},\n\nPlease verify your email by visiting: ${verificationUrl}\n\nBest regards,\nThe Nova-Search Team`
            });
        } catch (emailError) {
            emailSent = false;
            console.error("[AUTH] Email send warning:", emailError.message);
        }

        return res.status(201).json({
            message: emailSent
                ? "Account created. Please check your email to verify your account."
                : "Account created, but verification email could not be delivered. Please check email settings.",
            success: true,
            emailSent,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                verified: user.verified
            }
        });
    } catch (error) {
        console.error("[AUTH] Register error:", error);
        return res.status(500).json({
            message: "Failed to register account. Please try again later.",
            success: false,
            err: error.message
        });
    }
}

export async function login(req, res) {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email: email.toLowerCase().trim() }).select("+password");

        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password",
                success: false,
                err: "User not found"
            });
        }

        const isPasswordMatch = await user.comparePassword(password);

        if (!isPasswordMatch) {
            return res.status(400).json({
                message: "Invalid email or password",
                success: false,
                err: "Incorrect password"
            });
        }

        if (!user.verified) {
            return res.status(403).json({
                message: "Please verify your email before logging in",
                success: false,
                err: "Email not verified"
            });
        }

        const token = jwt.sign(
            {
                id: user._id,
                username: user.username,
                email: user.email
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: "/"
        });

        return res.status(200).json({
            message: "Login successful",
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                verified: user.verified,
                preferences: user.preferences
            }
        });
    } catch (error) {
        console.error("[AUTH] Login error:", error);
        return res.status(500).json({
            message: "Internal server error during login",
            success: false,
            err: error.message
        });
    }
}

export async function logout(req, res) {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            path: "/"
        });

        return res.status(200).json({
            message: "Logged out successfully",
            success: true
        });
    } catch (error) {
        console.error("[AUTH] Logout error:", error);
        return res.status(500).json({
            message: "Failed to log out",
            success: false,
            err: error.message
        });
    }
}

export async function getMe(req, res) {
    try {
        const userId = req.user.id;
        const user = await userModel.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false,
                err: "User not found"
            });
        }

        return res.status(200).json({
            message: "User details fetched successfully",
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                verified: user.verified,
                preferences: user.preferences
            }
        });
    } catch (error) {
        console.error("[AUTH] GetMe error:", error);
        return res.status(500).json({
            message: "Failed to retrieve user information",
            success: false,
            err: error.message
        });
    }
}

export async function verifyEmail(req, res) {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({
                message: "Verification token is required",
                success: false,
                err: "No token provided"
            });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (jwtErr) {
            const isExpired = jwtErr.name === "TokenExpiredError";
            return res.status(400).json({
                message: isExpired ? "Verification token has expired" : "Invalid verification token",
                success: false,
                err: jwtErr.message,
                expired: isExpired
            });
        }

        const user = await userModel.findOne({ email: decoded.email });

        if (!user) {
            return res.status(404).json({
                message: "User account not found",
                success: false,
                err: "User not found"
            });
        }

        if (user.verified) {
            // Check if request is browser navigate (HTML accept header)
            if (req.accepts("html") && !req.xhr && !req.headers["accept"]?.includes("application/json")) {
                const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
                return res.redirect(`${frontendUrl}/verify-email?status=already_verified`);
            }
            return res.status(200).json({
                message: "Email is already verified. You can now log in.",
                success: true,
                alreadyVerified: true
            });
        }

        user.verified = true;
        await user.save();

        if (req.accepts("html") && !req.xhr && !req.headers["accept"]?.includes("application/json")) {
            const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
            return res.redirect(`${frontendUrl}/verify-email?status=success`);
        }

        return res.status(200).json({
            message: "Email verified successfully! You can now log in to your account.",
            success: true
        });
    } catch (error) {
        console.error("[AUTH] Verify email error:", error);
        return res.status(500).json({
            message: "Failed to verify email",
            success: false,
            err: error.message
        });
    }
}