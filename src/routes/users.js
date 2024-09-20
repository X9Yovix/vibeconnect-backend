const express = require("express")
const router = express.Router()

const { getFriendsList, searchUsers, unfriend, searchMyFriends } = require("../controllers/users")
const authenticateJWT = require("../middlewares/auth")

router.get("/friends", authenticateJWT, getFriendsList)
router.get("/search", authenticateJWT, searchUsers)
router.delete("/unfriend/:receiverId", authenticateJWT, unfriend)
router.get("/messages/friends/search", authenticateJWT, searchMyFriends)

const User = require("../models/users")

router.get("/seed", async (req, res) => {
  const users = [
    {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      password: "john.doe@example.com",
      privacy: "public"
    },
    {
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.smith@example.com",
      password: "jane.smith@example.com",
      privacy: "private"
    },
    {
      firstName: "Alice",
      lastName: "Johnson",
      email: "alice.johnson@example.com",
      password: "alice.johnson@example.com",
      privacy: "public"
    },
    {
      firstName: "Bob",
      lastName: "Brown",
      email: "bob.brown@example.com",
      password: "bob.brown@example.com",
      privacy: "private"
    },
    {
      firstName: "Charlie",
      lastName: "Davis",
      email: "charlie.davis@example.com",
      password: "charlie.davis@example.com",
      privacy: "public"
    },
    {
      firstName: "Eve",
      lastName: "Miller",
      email: "eve.miller@example.com",
      password: "eve.miller@example.com",
      privacy: "private"
    },
    {
      firstName: "Frank",
      lastName: "Wilson",
      email: "frank.wilson@example.com",
      password: "frank.wilson@example.com",
      privacy: "public"
    },
    {
      firstName: "Grace",
      lastName: "Moore",
      email: "grace.moore@example.com",
      password: "grace.moore@example.com",
      privacy: "private"
    },
    {
      firstName: "Hank",
      lastName: "Taylor",
      email: "hank.taylor@example.com",
      password: "hank.taylor@example.com",
      privacy: "public"
    },
    {
      firstName: "Ivy",
      lastName: "Anderson",
      email: "ivy.anderson@example.com",
      password: "ivy.anderson@example.com",
      privacy: "private"
    }
  ]

  for (const user of users) {
    try {
      const newUser = new User(user)
      await newUser.save()
      console.log(`User ${user.email} created successfully.`)
    } catch (error) {
      console.error(`Error creating user ${user.email}:`, error)
    }
  }
  res.send("Users seeded")
})

module.exports = router
