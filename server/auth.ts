import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

import * as $z from './schema/check'

dotenv.config()

const JWT_KEY = process.env.JWT_KEY

export const createToken = (payload: object): string => {
    return jwt.sign(payload=$z.JWT_Payload.parse(payload), JWT_KEY as string, { expiresIn: '1h' })
}

export const jwtVerify = (token: string) => {
    return jwt.verify(token=$z.JWT.parse(token), JWT_KEY as string)
}
