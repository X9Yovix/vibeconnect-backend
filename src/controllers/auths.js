const User = require("../models/users")
const passport = require("passport")
const jwt = require("jsonwebtoken")
const process = require("process")

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body
    let user = await User.findOne({ email })
    if (user) {
      return res.status(400).json({ error: "User already exists" })
    }
    user = new User({ name, email, password })
    await user.save()
    res.status(201).json({ message: "User created successfully" })
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
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(400).json({ error: "Incorrect password" })
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" })
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
  passport.authenticate("google", { scope: ["profile", "email"], prompt: "select_account" })
}

const googleAuthCallback = (req, res) => {
  const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, { expiresIn: "7d" })
  res.status(200).json({ token })
}

module.exports = {
  register,
  login,
  googleAuth,
  googleAuthCallback
}
