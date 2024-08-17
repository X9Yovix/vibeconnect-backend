const multer = require("multer")
const fs = require("fs")

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let destinationFolder = "uploads/users/"
    if (!fs.existsSync(destinationFolder)) {
      fs.mkdirSync(destinationFolder, { recursive: true })
    }
    cb(null, destinationFolder)
  },
  filename: function (req, file, cb) {
    const name = file.originalname.toLowerCase().split(" ").join("-")
    cb(null, Date.now() + "-" + name)
  }
})

module.exports = multer({ storage: storage })
