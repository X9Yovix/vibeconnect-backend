const express = require("express")
const router = express.Router()
const passport = require("passport")
const { register, login, googleAuth, googleAuthCallback, forgetPassword, resetPassword, logout } = require("../controllers/auths")
const { validateRegister, validateLogin, validateForgetPassword, validateResetPassword } = require("../validators/auths")
const upload = require("../middlewares/storage_register")
const authenticateJWT = require("../middlewares/auth")

/**
 * @swagger
 * /auths/register:
 *   post:
 *     summary: Register a new user
 *     description: Registers a new user with optional profile image upload.
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: First name of the user
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 description: Last name of the user
 *                 example: "Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password (min 8 characters)
 *                 example: "john.doe@example.com"
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Profile image of the user
 *     responses:
 *       '201':
 *         description: Account created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Account created successfully"
 *       '400':
 *         description: Validation error or email already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Email already exists"
 *       '500':
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Server error"
 */
router.post("/register", upload.single("image"), validateRegister, register)

/**
 * @swagger
 * /auths/login:
 *   post:
 *     summary: Login a user
 *     description: Authenticates a user and returns a JWT token.
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password (min 8 characters)
 *                 example: "john.doe@example.com"
 *     responses:
 *       '200':
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   description: User object without password
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60c72b2f9b1d8e3f4c8b4567"
 *                     firstName:
 *                       type: string
 *                       example: "John"
 *                     lastName:
 *                       type: string
 *                       example: "Doe"
 *                     email:
 *                       type: string
 *                       example: "john.doe@example.com"
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *       '400':
 *         description: Validation error or user authentication failure
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Incorrect password"
 *       '500':
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Server error"
 */
router.post("/login", validateLogin, login)

/**
 * @swagger
 * /auths/google:
 *   get:
 *     summary: Initiate Google authentication
 *     description: Redirects the user to Google for authentication.
 *     tags:
 *       - User
 *     responses:
 *       '302':
 *         description: Redirects to Google's authentication page
 *       '401':
 *         description: User is not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User not authenticated"
 */
router.get("/google", googleAuth)

/**
 * @swagger
 * /auths/google/callback:
 *   get:
 *     summary: Google authentication callback
 *     description: Handles the response from Google after authentication and redirects to the frontend.
 *     tags:
 *       - User
 *     responses:
 *       '302':
 *         description: Redirects to the frontend application after successful authentication
 *       '401':
 *         description: Authentication failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Authentication failed"
 */
router.get("/google/callback", passport.authenticate("google", { failureRedirect: "/" }), googleAuthCallback)

/**
 * @swagger
 * /auths/forget-password:
 *   post:
 *     summary: Request password reset
 *     description: Sends a password reset email to the user with a reset token.
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address to receive the reset link
 *                 example: "john.doe@example.com"
 *     responses:
 *       '200':
 *         description: Password reset email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password reset email sent successfully, check your email"
 *       '400':
 *         description: Email not found or validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Email not found"
 *       '500':
 *         description: Server error while sending email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error sending password reset email, try again later"
 */
router.post("/forget-password", validateForgetPassword, forgetPassword)

/**
 * @swagger
 * /auths/reset-password/{token}:
 *   post:
 *     summary: Reset user password
 *     description: Resets the user's password using a valid reset token.
 *     tags:
 *       - User
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         description: The password reset token from the user's email
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *                 description: New password (min 8 characters)
 *                 example: "newpassword123"
 *     responses:
 *       '200':
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password changed successfully"
 *       '400':
 *         description: Invalid or expired token, or validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid or expired token"
 *       '500':
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Server error"
 */
router.post("/reset-password/:token", validateResetPassword, resetPassword)

/**
 * @swagger
 * /auths/logout:
 *   get:
 *     summary: Logout user
 *     description: Logs out the user by clearing the authentication token.
 *     tags:
 *       - User
 *     responses:
 *       '200':
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Logout successful"
 *       '500':
 *         description: Server error during logout
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Server error"
 */
router.get("/logout", logout)


/**
 * @swagger
 * /auths/is-authenticated:
 *   get:
 *     summary: Check if user is authenticated
 *     description: Verifies if the user is authenticated based on the provided JWT token.
 *     tags:
 *       - User
 *     responses:
 *       '200':
 *         description: User is authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isAuthenticated:
 *                   type: boolean
 *                   example: true
 *       '401':
 *         description: Unauthorized, user is not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *       '500':
 *         description: Server error during authentication check
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Server error"
 */
router.get("/is-authenticated", authenticateJWT, (req, res) => {
  res.status(200).json({ isAuthenticated: true })
})

module.exports = router
