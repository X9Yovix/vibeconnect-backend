const express = require("express")
const router = express.Router()
const passport = require("passport")
const { register, login, googleAuth, googleAuthCallback, forgetPassword, resetPassword, logout } = require("../controllers/auths")
const { validateRegister, validateLogin, validateForgetPassword, validateResetPassword } = require("../validators/auths")
const upload = require("../middlewares/storage_register")
const authenticateJWT = require("../middlewares/auth")

router.post("/register", upload.single("image"), validateRegister, register)
router.post("/login", validateLogin, login)
router.get("/google", googleAuth)
router.get("/google/callback", passport.authenticate("google", { failureRedirect: "/" }), googleAuthCallback)
router.post("/forget-password", validateForgetPassword, forgetPassword)
router.post("/reset-password/:token", validateResetPassword, resetPassword)
router.get("/logout", logout)
router.get("/is-authenticated", authenticateJWT, (req, res) => {
  res.status(200).json({ isAuthenticated: true })
})

module.exports = router
