const nodemailer = require("nodemailer")

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
})

const sendEmailService = async (to, subject, html) => {
  try {
    const message = {
      from: process.env.SMTP_FROM,
      to,
      subject,
      html: html
    }

    const info = await transporter.sendMail(message)
    return info.accepted ? true : false
  } catch (error) {
    console.error("Error occurred while sending email:", error)
    return false
  }
}

module.exports = sendEmailService
