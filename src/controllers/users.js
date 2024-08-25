const User = require("../models/users")
const FriendRequest = require("../models/friend_requests")
const Friendships = require("../models/friendships")

const searchUsers = async (req, res) => {
  try {
    const { query } = req.query
    const currentUserId = req.user._id

    if (!query || query.length < 1) {
      return res.status(400).json({ error: "Search query is required" })
    }

    const users = await User.find({
      _id: { $ne: currentUserId },
      $or: [
        { firstName: { $regex: query, $options: "i" } },
        { lastName: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } }
      ]
    }).select("firstName lastName email image")

    const userWithRequestStatus = await Promise.all(
      users.map(async (user) => {
        const isFriend = await Friendships.exists({
          $or: [
            { user1: currentUserId, user2: user._id },
            { user1: user._id, user2: currentUserId }
          ]
        })

        const hasPendingRequest = await FriendRequest.exists({
          sender: currentUserId,
          receiver: user._id,
          status: "pending"
        })

        const receivedRequest = await FriendRequest.exists({
          sender: user._id,
          receiver: currentUserId,
          status: "pending"
        })

        return {
          ...user.toObject(),
          isFriend,
          hasPendingRequest,
          receivedRequest
        }
      })
    )
    return res.status(200).json({ users: userWithRequestStatus })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Server error" })
  }
}

const searchMyFriends = async (req, res) => {
  try {
    const currentUserId = req.user._id
    const { query } = req.query

    if (!query || query.length < 1) {
      return res.status(400).json({ error: "Search query is required" })
    }

    const friendshipsResult = await Friendships.find({
      $or: [{ user1: currentUserId }, { user2: currentUserId }]
    })

    if (friendshipsResult.length < 1) {
      return res.status(200).json([])
    }

    const friendIds = friendshipsResult.map((friendship) => (friendship.user1.equals(currentUserId) ? friendship.user2 : friendship.user1))

    const friends = await User.find({
      _id: { $in: friendIds },
      $or: [{ firstName: { $regex: query, $options: "i" } }, { lastName: { $regex: query, $options: "i" } }]
    })

    res.status(200).json(friends)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Server error" })
  }
}

const getFriendsList = async (req, res) => {
  try {
    const currentUserId = req.user._id

    const friendships = await Friendships.find({
      $or: [{ user1: currentUserId }, { user2: currentUserId }]
    })
      .populate("user1", "firstName lastName image email")
      .populate("user2", "firstName lastName image email")

    const friends = friendships.map((friendship) =>
      friendship.user1._id.toString() === currentUserId.toString() ? friendship.user2 : friendship.user1
    )

    return res.status(200).json({ friends })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Server error" })
  }
}

const unfriend = async (req, res) => {
  try {
    const { receiverId } = req.params
    const currentUserId = req.user._id

    const result = await Friendships.findOneAndDelete({
      $or: [
        { user1: currentUserId, user2: receiverId },
        { user1: receiverId, user2: currentUserId }
      ]
    })

    if (!result) {
      return res.status(404).json({ error: "Friendship not found" })
    }

    res.status(200).json({ message: "Friendship removed" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Server error" })
  }
}

module.exports = {
  searchUsers,
  searchMyFriends,
  getFriendsList,
  unfriend
}
