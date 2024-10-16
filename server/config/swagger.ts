import { Options } from 'swagger-jsdoc';
import { Schema } from 'zod';

export const swaggerOptions: Options = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'ChatServer Restful API',
            version: '1.0.0',
            description: 'API documentation for the Chat application',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Restful API Server'
            },
            {
                url: 'ws://localhost:3000',
                description: 'WebSocket API Server'
            },
        ],
        components: {
            schemas: {
                SocketClient: {
                    type: 'object',
                    properties: {
                        userid: {
                            type: 'string',
                            description: 'user id',
                            example: 'matt'
                        },
                        chatroom: {
                            type: 'string',
                            description: 'chatroom id',
                            example: 'room1'
                        }
                    }
                }
            }
        },
        paths: {}
    },
    apis: ['./**/*.ts', '../**/*.ts'],
}