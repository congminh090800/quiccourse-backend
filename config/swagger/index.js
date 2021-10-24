const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const config = require('config');
const path = require('path');

module.exports = (app) => {
    const swaggerOptions = {
        swaggerDefinition: {
            openapi: '3.0.1',   
            info: {
                version: config.app.version,
                title: config.app.name,
                description: config.app.description,
                contact: {
                    name: "congminh090800@gmail.com"
                },
            },
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT',
                    },
                },
            },
            security: [{
                bearerAuth: [],
            }],
        },
        apis: [path.resolve(__dirname, '../../features/**/*.js')],
    };
      
    const swaggerDocs = swaggerJsDoc(swaggerOptions);
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
}