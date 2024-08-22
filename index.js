const express = require("express")
const dotenv = require("dotenv")
dotenv.config()
const cors = require("cors")
const session = require("express-session")
const passport = require("passport")
require("./configs/passport_google")
const dbConnection = require("./configs/db")
const authRoutes = require("./src/routes/auths")
const messageRoutes = require("./src/routes/messages")
const userRoutes = require("./src/routes/users")
const friendRequestRoutes = require("./src/routes/friend_requests")
const cookieParser = require("cookie-parser")
const path = require("path")
//const corsOptions = require("./configs/cors")

const app = express()
app.use(
  cors({
    origin: process.env.FRONTEND_URI,
    credentials: true
  })
)
const port = process.env.PORT || 4000

app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: true
  })
)

app.use(passport.initialize())
app.use(passport.session())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(__dirname + "/public"))
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

app.use(cookieParser())

app.use("/auths", authRoutes)
app.use("/messages", messageRoutes)
app.use("/users", userRoutes)
app.use("/friend-requests", friendRequestRoutes)

dbConnection()
  .then(() => {
    app.listen(port, () => {
      console.log(`App is running on port ${port}`)
    })
  })
  .catch((err) => {
    console.error("Database connection error:", err)
    process.exit(1)
  })
