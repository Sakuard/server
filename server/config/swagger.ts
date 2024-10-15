import { Options } from 'swagger-jsdoc';

export const swaggerAPIOptions: Options = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Chat API',
            version: '1.0.0',
            description: 'API documentation for the Chat application',
        },
        servers: [
            {
                url: 'http://localhost:3000',
            },
        ],
    },
    apis: ['./**/*.ts'], // Path to the API docs
}


export const swaggerSocketOptions: Options = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'ChatServer Socket-API',
            version: '1.0.0',
            description: 'WebSocketAPI documentation for the Chat Server',
        },
        servers: [
            {
                url: 'ws://localhost:3000',
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
        paths: {
            '/socketapi/user/join/v1': {
                post: {
                    summary: 'Client join chatroom',
                    requestBody: {
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/SocketClient'
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    apis: ['../**/*.ts'], // Path to the API docs
}