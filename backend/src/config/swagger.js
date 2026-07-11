const swaggerJsdoc = require("swagger-jsdoc");

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "EventFlow API",
    version: "1.0.0",
    description:
      "REST API documentation for the EventFlow event management system",
  },
  servers: [
    {
      url: "http://localhost:5000",
      description: "Local development server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  tags: [
    { name: "Health" },
    { name: "Authentication" },
    { name: "Users" },
    { name: "Employees" },
    { name: "Event Types" },
    { name: "Event Requests" },
    { name: "Events" },
    { name: "Dashboard" },
  ],
};

const options = {
  definition: swaggerDefinition,
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;