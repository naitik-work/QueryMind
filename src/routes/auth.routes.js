import { Router } from "express";
import { register, verifyEmail, login, getMe } from "../controllers/auth.controller.js";
import { registerValidator, loginValidator } from "../validators/auth.validator.js";
import { authUser } from "../middleware/auth.middleware.js";
const authRouter = Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 * @body { username, email, password }
 */
authRouter.post("/register", registerValidator, register);

/**
 * @route GET /api/auth/verify-email
 * @desc Verify user's email address
 * @access Public
 * @query { token }
 */
authRouter.get('/verify-email', verifyEmail)


/**
 * @route POST /api/auth/login
 * @desc Login a user and return a JWT token
 * @access Public
 * @body { email, password }
 */
authRouter.post('/login', loginValidator, login);

/**
 * @route POST /api/auth/get-me
 * @desc Get the current user's information
 * @access Private
 */
authRouter.get('/get-me',authUser, getMe);


export default authRouter;


