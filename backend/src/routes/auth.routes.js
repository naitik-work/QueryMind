import { Router } from "express";
import { getMe, login, register, verifyEmail } from "../controllers/auth.controller.js";
import { loginValidator, registerValidationRules } from "../validator/auth.validation.js";
import { authUser } from "../middlewares/auth.middlewares.js";

const authRouter = Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 * @body {username,email,password}
 */
authRouter.post(
    "/register",
    registerValidationRules,
    register
);

authRouter.post("/login", loginValidator, login)


authRouter.get("/get-me", authUser, getMe)
authRouter.get("/verify-email", verifyEmail)


export default authRouter;