const express = require("express")
const router = express.Router()

const { getMessages, sendMessage } = require("../controllers/messages")
const authenticateJWT = require("../middlewares/auth")

router.get("/:receiverId", authenticateJWT, getMessages)
router.post("/send/:receiverId", authenticateJWT, sendMessage)

module.exports = router
