const express = require("express")
const router = express.Router()
const passport = require("passport")
const { register, login, googleAuth, googleAuthCallback } = require("../controllers/auths")
const { validateRegister, validateLogin } = require("../validators/auths")

router.post("/register", validateRegister, register)
router.post("/login", validateLogin, login)
router.get("/google", googleAuth)
router.get("/google/callback", passport.authenticate("google", { failureRedirect: "/" }), googleAuthCallback)

module.exports = router
