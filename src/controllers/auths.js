const passport = require("passport")
const jwt = require("jsonwebtoken")
const cryptoJs = require("crypto-js")
const path = require("path")
const fs = require("fs")
const User = require("../models/users")
const ResetPassword = require("../models/reset_passwords")
const sendEmailService = require("../services/nodemailer")

const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body
    let user = await User.findOne({ email })
    if (user) {
      return res.status(400).json({ error: "Email already exists" })
    }
    if (!req.file) {
      user = new User({ firstName: firstName, lastName: lastName, email: email, password: password })
    } else {
      const imgPath = req.file.path
      user = new User({ firstName: firstName, lastName: lastName, email: email, password: password, image: imgPath })
    }

    await user.save()
    res.status(201).json({ message: "Account created successfully" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Server error" })
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(400).json({ error: "User does not exist" })
    }

    if (!user.password) {
      return res.status(400).json({ error: "This account does not have a password. Please use Google login or reset your password." })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(400).json({ error: "Incorrect password" })
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN })
    res.status(200).json({ token })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Server error" })
  }
}

const googleAuth = (req, res) => {
  if (req.isAuthenticated()) {
    return googleAuthCallback(req, res)
  }
  passport.authenticate("google", { scope: ["profile", "email"] })(req, res)
}

const googleAuthCallback = (req, res) => {
  const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN })
  res.redirect(`${process.env.FRONTEND_URI}?token=${token}`)
}

const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({
        error: "Email not found"
      })
    }

    const existingResetToken = await ResetPassword.findOne({
      user: user._id,
      createdAt: { $gt: Date.now() - process.env.RESET_TOKEN_EXPIRATION_H * 60 * 60 * 1000 }
    })

    let resetToken

    if (existingResetToken) {
      resetToken = existingResetToken.token
    } else {
      resetToken = cryptoJs.SHA256(email + Date.now().toString()).toString()
      const resetPassword = new ResetPassword({
        user: user._id,
        token: resetToken,
        expires: Date.now() + process.env.RESET_TOKEN_EXPIRATION_H * 60 * 60 * 1000
      })
      await resetPassword.save()
    }

    const emailSubject = "Password Reset"
    const htmlTemplatePath = path.join(__dirname, "../views", "reset_password.html")
    const htmlTemplate = fs.readFileSync(htmlTemplatePath, "utf-8")
    const htmlContent = htmlTemplate.replace("resetLink", `${process.env.FRONTEND_URI}/reset-password/${resetToken}`)

    const emailSent = await sendEmailService(email, emailSubject, htmlContent)

    if (emailSent) {
      return res.status(200).json({
        message: "Password reset email sent successfully, check your email"
      })
    } else {
      return res.status(500).json({
        error: "Error sending password reset email, try again later"
      })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Server error" })
  }
}

const resetPassword = async (req, res) => {
  try {
    const { password } = req.body
    const token = req.params.token

    const resetPassword = await ResetPassword.findOne({
      token,
      expires: { $gt: Date.now() }
    })

    if (!resetPassword) {
      return res.status(400).json({
        error: "Invalid or expired token hna"
      })
    }
    const user = await User.findById(resetPassword.user)

    if (!user) {
      return res.status(400).json({
        error: "Invalid or expired token"
      })
    }

    user.password = password
    await resetPassword.deleteOne()
    await user.save()

    res.status(200).json({
      message: "Password reset successful"
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Server error" })
  }
}

module.exports = {
  register,
  login,
  googleAuth,
  googleAuthCallback,
  forgetPassword,
  resetPassword
}
