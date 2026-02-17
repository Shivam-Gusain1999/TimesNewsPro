import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0", // Ye Swagger ka standard version hai
    info: {
      title: "Times News Pro API", // Tumhare Project ka naam
      version: "1.0.0",
      description: "API Documentation for News Portal Application", // Choti si detail
      contact: {
        name: "Shivam Gusain", // Apna naam likho, Senior lagoge!
        email: "shivam@example.com",
      },
    },
    servers: [
      {
        url: "http://localhost:4000/api/v1", // Hamari base URL
        description: "Development Server",
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
  },
  // Ye sabse important line hai: Swagger kahan dhoondega APIs ko?
  apis: ["./src/routes/*.js"], 
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;