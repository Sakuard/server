/**
 * @swagger
 * /socketapi/user/join/v1:
 *  post:
 *    tags:
 *      - WebSocket API
 *    summary: Client join chatroom
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/SocketClient'
 *    responses:
 *      200:
 *        description: A successful response
 *      500:
 *        description: Internal server error
 */

/**
 * @swagger
 * /socketapi/user/connection/test:
 *  post:
 *    tags:
 *      - WebSocket API
 *    summary: connection test
 *    responses:
 *      200:
 *        description: A successful response
 *      500:
 *        description: Internal server error
 */
