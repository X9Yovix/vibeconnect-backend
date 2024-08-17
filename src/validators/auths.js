const Joi = require("joi")

const validateRegister = (req, res, next) => {
  const schema = Joi.object({
    firstName: Joi.string().min(3).max(255).required(),
    lastName: Joi.string().min(3).max(255).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(255).required()
  })
  const { error } = schema.validate(req.body)
  if (error) {
    return res.status(400).json({ error: error.details[0].message })
  }
  next()
}

const validateLogin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(255).required()
  })
  const { error } = schema.validate(req.body)
  if (error) {
    return res.status(400).json({ error: error.details[0].message })
  }
  next()
}

const validateForgetPassword = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required()
  })
  const { error } = schema.validate(req.body)
  if (error) {
    return res.status(400).json({ error: error.details[0].message })
  }
  next()
}

const validateResetPassword = (req, res, next) => {
  const schema = Joi.object({
    password: Joi.string().min(8).max(255).required()
  })
  const { error } = schema.validate(req.body)
  if (error) {
    return res.status(400).json({ error: error.details[0].message })
  }
  next()
}

module.exports = {
  validateRegister,
  validateLogin,
  validateForgetPassword,
  validateResetPassword
}
