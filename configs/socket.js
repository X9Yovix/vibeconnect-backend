const express = require("express")
const app = express()

const http = require("http")
const server = http.createServer(app)

const { Server } = require("socket.io")

const mongoose = require("mongoose")
const User = require("../src/models/users")
const Friendship = require("../src/models/friendships")
const Message = require("../src/models/messages")

const io = new Server(server, {
  cors: {
    origin: [process.env.FRONTEND_URI],
    methods: ["GET", "POST"]
  }
})

const userSocketMap = {}

io.on("connection", async (socket) => {
  console.log("a user connected", socket.id)

  const userId = socket.handshake.query.userId
  if (userId !== "undefined") {
    userSocketMap[userId] = socket.id

    // notify friends that this user is now online
    const friends = await Friendship.find({
      $or: [{ user1: userId }, { user2: userId }]
    }).populate("user1 user2")

    const friendIds = friends.map((friendship) =>
      friendship.user1._id.toString() === userId ? friendship.user2._id.toString() : friendship.user1._id.toString()
    )

    friendIds.forEach((friendId) => {
      if (userSocketMap[friendId]) {
        io.to(userSocketMap[friendId]).emit("friendOnline", userId)
      }
    })

    // get online friends
    socket.on("getOnlineFriends", async () => {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        console.log("invalid user id / empty user id")
        return socket.emit("getOnlineFriendsResponse", [])
      }

      const friends = await Friendship.find({
        $or: [{ user1: userId }, { user2: userId }]
      }).populate("user1 user2")

      const friendIds = friends.map((friendship) =>
        friendship.user1._id.toString() === userId ? friendship.user2._id.toString() : friendship.user1._id.toString()
      )

      const onlineFriends = friendIds.filter((id) => userSocketMap[id])
      //console.log(onlineFriends)
      socket.emit("getOnlineFriendsResponse", onlineFriends)
    })

    // notify user that he received a new message (sidebar)
    socket.on("newMessage", ({ message }) => {
      socket.emit("newMessage", { message })
    })

    // notify user number of unseen messages (main conversation)
    socket.on("unseenCount", ({ unseenCount }) => {
      socket.emit("unseenCount", { unseenCount })
    })
  }

  socket.on("disconnect", async () => {
    console.log("user disconnected", socket.id)

    if (userId) {
      const friends = await Friendship.find({
        $or: [{ user1: userId }, { user2: userId }]
      }).populate("user1 user2")

      const friendIds = friends.map((friendship) =>
        friendship.user1._id.toString() === userId ? friendship.user2._id.toString() : friendship.user1._id.toString()
      )

      // notify each online friend that this user has disconnected
      friendIds.forEach((friendId) => {
        if (userSocketMap[friendId]) {
          io.to(userSocketMap[friendId]).emit("friendDisconnected", userId)
        }
      })

      delete userSocketMap[userId]
      io.emit("getOnlineFriends", Object.keys(userSocketMap))
    }
  })
})

module.exports = { app, server, io, userSocketMap }
