const User = require("../models/users")
const FriendRequest = require("../models/friend_requests")
const Friendships = require("../models/friendships")

const sendFriendRequest = async (req, res) => {
  try {
    const { receiverId } = req.params
    const senderId = req.user._id

    const receiver = await User.findById(receiverId)
    if (!receiver) {
      return res.status(404).json({ error: "User not found" })
    }

    const existingRequest = await FriendRequest.findOne({
      sender: senderId,
      receiver: receiverId,
      status: "pending"
    })

    if (existingRequest) {
      return res.status(400).json({ error: "Friend request already sent" })
    }

    const friendRequest = new FriendRequest({ sender: senderId, receiver: receiverId })
    await friendRequest.save()

    return res.status(200).json({ message: "Friend request sent" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Server error" })
  }
}

const cancelFriendRequest = async (req, res) => {
  try {
    const { receiverId } = req.params
    const senderId = req.user._id

    const request = await FriendRequest.findOneAndDelete({
      sender: senderId,
      receiver: receiverId,
      status: "pending"
    })

    if (!request) {
      return res.status(400).json({ error: "No pending friend request found to cancel" })
    }

    return res.status(200).json({ message: "Friend request canceled" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Server error" })
  }
}

const acceptFriendRequest = async (req, res) => {
  try {
    const { senderId } = req.params
    const receiverId = req.user._id

    const request = await FriendRequest.findOne({
      sender: senderId,
      receiver: receiverId,
      status: "pending"
    })

    if (!request) {
      return res.status(400).json({ error: "No pending friend request found" })
    }

    await request.deleteOne()

    const friendship = new Friendships({ user1: senderId, user2: receiverId })
    await friendship.save()

    return res.status(200).json({ message: "Friend request accepted" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Server error" })
  }
}

const declineFriendRequest = async (req, res) => {
  try {
    const { senderId } = req.params
    const receiverId = req.user._id

    const request = await FriendRequest.findOne({
      sender: senderId,
      receiver: receiverId,
      status: "pending"
    })

    if (!request) {
      return res.status(400).json({ error: "No pending friend request found" })
    }

    await request.deleteOne()

    return res.status(200).json({ message: "Friend request declined" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Server error" })
  }
}

const getFriendRequests = async (req, res) => {
  try {
    const userId = req.user._id

    const pendingRequests = await FriendRequest.find({
      receiver: userId,
      status: "pending"
    })
      .populate("sender", "firstName lastName image email")
      .select("sender createdAt")

    return res.status(200).json({ friendRequests: pendingRequests })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Server error" })
  }
}

module.exports = {
  sendFriendRequest,
  cancelFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  getFriendRequests
}
