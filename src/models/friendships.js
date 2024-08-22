const mongoose = require("mongoose")

const friendshipSchema = new mongoose.Schema(
  {
    user1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true
    },
    user2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model("friendships", friendshipSchema)
