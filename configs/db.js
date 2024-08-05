const mongoose = require("mongoose")
const process = require("process")

const dbConnection = async () => {
  try {
    const dbUrl = process.env.MONGODB_URI
    await mongoose.connect(dbUrl, {
      dbName: process.env.MONGODB_NAME
    })
    console.log(`Connected to database: ${process.env.MONGODB_NAME}`)
  } catch (error) {
    console.error("Database connection error:", error)
  }
}

module.exports = dbConnection
