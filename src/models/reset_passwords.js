const mongoose = require("mongoose")

const resetPasswordsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true
  },
  token: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expires: {
    type: Date,
    default: () => Date.now() + process.env.RESET_TOKEN_EXPIRATION_H * 60 * 60 * 1000
  }
})

module.exports = mongoose.model("reset_passwords", resetPasswordsSchema)
