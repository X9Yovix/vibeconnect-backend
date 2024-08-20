const Message = require("../models/messages")
const Conversation = require("../models/conversations")

const sendMessage = async (req, res) => {
  try {
    const { receiverId } = req.params
    const { message } = req.body
    const senderId = req.user._id

    let conversation = await Conversation.findOne({
      participants: [senderId, receiverId]
    })

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId]
      })
    }

    const newMessage = new Message({
      senderId: senderId,
      receiverId: receiverId,
      message: message
    })

    if (newMessage) {
      conversation.messages.push(newMessage)
    }

    await Promise.all([conversation.save(), newMessage.save()])

    return res.status(201).json({ newMessage })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Server error" })
  }
}

const getMessages = async (req, res) => {
  try {
    const { receiverId } = req.params
    const senderId = req.user._id

    const conversation = await Conversation.findOne({
      participants: [senderId, receiverId]
    }).populate("messages")

    if (!conversation) {
      return res.status(404).json({ messages: [] })
    }

    return res.status(200).json({ messages: conversation.messages })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Server error" })
  }
}

module.exports = {
  sendMessage,
  getMessages
}
