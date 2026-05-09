const { Router } = require('express')
const authController = require("../controllers/auth.controller")
const authMiddleware = require("../middlewares/auth.middleware")   

const authRouter = Router()

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
authRouter.post("/register", authController.registerUserController)

/**
 * @route POST /api/auth/login
 * @desc Login an existing user
 * @access Public
 */
authRouter.post("/login", authController.loginUserController)

/**
 * @route POST /api/auth/logout
 * @desc clear token from user cookie and add token in the blacklist
 * @access Public
 */
authRouter.get("/logout", authController.logoutUserController)

/**
 * @route POST /api/auth/get-me
 * @desc Get the current logged-in user's information
 * @access Private
 */
authRouter.get("/get-me", authMiddleware, authController.getMeController)

module.exports = authRouter;