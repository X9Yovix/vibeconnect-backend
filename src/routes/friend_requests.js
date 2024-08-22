const express = require("express")
const router = express.Router()

const {
  sendFriendRequest,
  cancelFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  getFriendRequests
} = require("../controllers/friend_requests")
const authenticateJWT = require("../middlewares/auth")

router.get("/:receiverId", authenticateJWT, sendFriendRequest)
router.delete("/:receiverId", authenticateJWT, cancelFriendRequest)
router.post("/accept/:senderId", authenticateJWT, acceptFriendRequest)
router.post("/decline/:senderId", authenticateJWT, declineFriendRequest)
router.get("/", authenticateJWT, getFriendRequests)

module.exports = router
