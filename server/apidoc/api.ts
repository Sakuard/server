/**
 * @swagger
 * /api/user/auth/v1:
 *  post:
 *    summary: create a JWT token
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              username:
 *                type: string
 *                example: "Matt"
 *              role:
 *                type: string
 *                example: "user"
 *    responses:
 *      200:
 *        description: A successful response
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: string
 *                token:
 *                  type: string
 *      500:
 *        description: Internal server error
 */

/**
 * @swagger
 * /api/user/chat/v1:
 *  post:
 *    summary: send message to chatroom
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              msg:
 *                type: string
 *                example: "Hello, world!"
 *              chatroom:
 *                type: string
 *                example: "room1"
 *    responses:
 *      200:
 *        description: A successful response
 *      500:
 *        description: Internal server error
 */