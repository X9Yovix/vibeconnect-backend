const express = require("express")
const router = express.Router()

const { getFriendsList, searchUsers, unfriend, searchMyFriends } = require("../controllers/users")
const authenticateJWT = require("../middlewares/auth")

router.get("/friends", authenticateJWT, getFriendsList)
router.get("/search", authenticateJWT, searchUsers)
router.delete("/unfriend/:receiverId", authenticateJWT, unfriend)
router.get("/messages/friends/search", authenticateJWT, searchMyFriends)

module.exports = router
