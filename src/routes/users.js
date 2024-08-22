const express = require("express")
const router = express.Router()

const { getFriendsList, searchUsers, unfriend } = require("../controllers/users")
const authenticateJWT = require("../middlewares/auth")

router.get("/friends", authenticateJWT, getFriendsList)
router.get("/search", authenticateJWT, searchUsers)
router.delete("/unfriend/:receiverId", authenticateJWT, unfriend)

module.exports = router
