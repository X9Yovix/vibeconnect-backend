const express = require("express")
const router = express.Router()

const { getMessages, sendMessage, getRecentContacts } = require("../controllers/messages")
const authenticateJWT = require("../middlewares/auth")

router.get("/:receiverId", authenticateJWT, getMessages)
router.post("/:receiverId", authenticateJWT, sendMessage)
router.get("/recent/contacts", authenticateJWT, getRecentContacts)

module.exports = router
