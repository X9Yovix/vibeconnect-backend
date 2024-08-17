const whiteList = [
  process.env.FRONTEND_URI,
  process.env.BACKEND_URI,
  "https://www.google.com",
  "https://www.googleapis.com",
  "https://accounts.google.com"
]

const corsOptions = {
  origin: (origin, callback) => {
    if (whiteList.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error("Not allowed by CORS"))
    }
  },
  optionsSuccessStatus: 200
}

module.exports = corsOptions
