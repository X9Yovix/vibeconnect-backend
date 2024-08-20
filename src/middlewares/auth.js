const jwt = require("jsonwebtoken")
const User = require("../models/users")

const authenticateJWT = async (req, res, next) => {
  try {
    const token = req.cookies.token

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    if (!decoded) {
      return res.status(401).json({ error: "Unauthorized" })
    }

    const user = await User.findById(decoded.userId)

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" })
    }

    req.user = user
    next()
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Server error" })
  }
}

module.exports = authenticateJWT
