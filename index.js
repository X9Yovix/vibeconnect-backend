const express = require("express")
const process = require("process")
const db = require("./config/db")
const dotenv = require("dotenv")
dotenv.config()

const app = express()

const port = process.env.PORT

db()
  .then(() => {
    app.listen(port, () => {
      console.log(`App is running on port ${port}`)
    })
  })
  .catch(() => {
    console.log("error")
  })
