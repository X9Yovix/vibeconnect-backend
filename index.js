const express = require("express")
const dotenv = require("dotenv")
dotenv.config()
const cors = require("cors")
const session = require("express-session")
const passport = require("passport")
require("./configs/passport_google")
const dbConnection = require("./configs/db")
const authRoutes = require("./src/routes/auths")
const authenticateJWT = require("./src/middlewares/auth")
const process = require("process")
//const corsOptions = require("./configs/cors")

const app = express()
app.use(cors())
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

app.use("/auths", authRoutes)
app.get("/profile", authenticateJWT, (req, res) => {
  res.send(req.user)
})

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
