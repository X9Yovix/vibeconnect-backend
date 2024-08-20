const mongoose = require("mongoose")

const messagesSchema = new mongoose.Schema(
  {
    senderId: {
      type: String,
      required: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: "users"
    },
    receiverId: {
      type: String,
      required: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: "users"
    },
    message: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model("messages", messagesSchema)
