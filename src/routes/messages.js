const express = require("express")
const router = express.Router()

const { getMessages, sendMessage, getRecentContacts, markMessagesAsSeen, countUnseenMessages } = require("../controllers/messages")
const authenticateJWT = require("../middlewares/auth")

router.get("/:receiverId", authenticateJWT, getMessages)
router.post("/:receiverId", authenticateJWT, sendMessage)
router.get("/recent/contacts", authenticateJWT, getRecentContacts)
router.put("/mark/seen/:receiverId", authenticateJWT, markMessagesAsSeen)
router.get("/unseen/count", authenticateJWT, countUnseenMessages)

module.exports = router
