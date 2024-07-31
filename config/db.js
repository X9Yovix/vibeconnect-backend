const mongoose = require("mongoose")
const process = require("process")

const DbConnection = async () => {
  try {
    const dbUrl = process.env.MONGODB_URI
    const dbName = process.env.MONGODB_NAME
    await mongoose.connect(dbUrl, { dbName })
    console.log(`Connected to database: ${dbName}`)
  } catch (error) {
    console.log("Database connection error:", error)
  }
}

module.exports = DbConnection
