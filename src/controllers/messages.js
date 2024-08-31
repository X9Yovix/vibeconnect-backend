const mongoose = require("mongoose")

const Message = require("../models/messages")
const Conversation = require("../models/conversations")
const User = require("../models/users")
const Friendship = require("../models/friendships")
const WS = require("../../configs/socket")

const sendMessage = async (req, res) => {
  try {
    const { receiverId } = req.params
    const { message } = req.body
    const senderId = req.user._id

    const receiver = await User.findById(receiverId)

    if (!receiver) {
      return res.status(404).json({ error: "User not found" })
    }

    const isFriend = await Friendship.findOne({
      $or: [
        { user1: senderId, user2: receiverId },
        { user1: receiverId, user2: senderId }
      ]
    })

    if (!isFriend && receiver.privacy === "private") {
      return res.status(403).json({ error: "User is private" })
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] }
    })

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId]
      })
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      message,
      seen: false
    })

    conversation.messages.push(newMessage)

    await Promise.all([conversation.save(), newMessage.save()])

    const unseenCount = await updateUnseenMessageCount(receiverId)

    const receiverSocketId = WS.userSocketMap[receiverId]
    if (receiverSocketId) {
      WS.io.to(receiverSocketId).emit("newMessage", newMessage)
      WS.io.to(receiverSocketId).emit("unseenCount", unseenCount)
    } else {
      console.error("receiver is not online")
    }

    return res.status(201).json({ newMessage })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: "Server error" })
  }
}

const getMessages = async (req, res) => {
  try {
    const { receiverId } = req.params
    const senderId = req.user._id
    const { limit = 20, skip = 0 } = req.query

    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] }
    }).populate({
      path: "messages",
      options: {
        sort: { createdAt: -1 },
        limit: parseInt(limit),
        skip: parseInt(skip)
      }
    })

    if (!conversation) {
      return res.status(200).json({ messages: [] })
    }

    return res.status(200).json({ messages: conversation.messages })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Server error" })
  }
}

const getRecentContacts = async (req, res) => {
  try {
    const currentUserId = req.user._id

    if (!mongoose.Types.ObjectId.isValid(currentUserId)) {
      return res.status(400).json({ error: "Invalid user ID" })
    }

    const conversations = await Conversation.find({
      participants: currentUserId
    })
      .populate({
        path: "messages",
        match: { seen: false, receiverId: currentUserId },
        select: "_id",
        options: { sort: { createdAt: -1 } }
      })
      .sort({ updatedAt: -1 })
      .limit(15)

    const recentContacts = []

    for (const conversation of conversations) {
      const otherParticipantId = conversation.participants.find((participant) => !participant.equals(currentUserId))

      const unseenCount = conversation.messages.length

      if (otherParticipantId && !recentContacts.some((contact) => contact._id.equals(otherParticipantId))) {
        const user = await User.findById(otherParticipantId, "firstName lastName image")
        if (user) {
          recentContacts.push({ ...user.toObject(), unseenCount })
        }
      }
    }

    res.status(200).json(recentContacts)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Server error" })
  }
}

const markMessagesAsSeen = async (req, res) => {
  try {
    const { receiverId } = req.params
    const currentUserId = req.user._id

    await Message.updateMany(
      {
        receiverId: currentUserId,
        senderId: receiverId,
        seen: false
      },
      { $set: { seen: true } }
    )

    res.status(200).json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Server error" })
  }
}

const countUnseenMessages = async (req, res) => {
  try {
    const currentUserId = req.user._id

    const unseenCount = await Message.countDocuments({
      receiverId: currentUserId,
      seen: false
    })

    res.status(200).json({ unseenCount })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Server error" })
  }
}

const updateUnseenMessageCount = async (receiverId) => {
  const unseenCount = await Message.countDocuments({
    receiverId: receiverId,
    seen: false
  })
  return unseenCount
}

module.exports = {
  sendMessage,
  getMessages,
  getRecentContacts,
  markMessagesAsSeen,
  countUnseenMessages
}
