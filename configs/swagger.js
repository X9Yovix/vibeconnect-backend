const swaggerJSDoc = require("swagger-jsdoc")

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Vibe Connect API",
    version: "1.0.0",
    description: "APIS for Vibe Connect",
  }
}

const options = {
  swaggerDefinition,
  apis: ["./src/routes/*.js"]
}

const swaggerSpec = swaggerJSDoc(options)
module.exports = swaggerSpec
