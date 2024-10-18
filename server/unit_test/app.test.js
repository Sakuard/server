import { describe, it, expect } from 'vitest'

import express from 'express'
import { Server, Socket } from 'socket.io'
import { createServer } from 'http'
import { handleConnection, broadcastMessage } from '../socket'

import * as $auth from '../auth'
import { io as ioc } from 'socket.io-client'

const socketURL = 'http://localhost:3000'

const port = 3000;
const app = express();
const server = createServer(app);
const ioServer = new Server(server);
ioServer.on('connection', handleConnection(ioServer));
server.listen(port, () => {})

describe('Socket Server Test', () => {
    it('Valid JWT payload', () => {
        const client = {
            username: 'testUser',
            role: 'user'
        }
        const token = $auth.createToken(client);
        const jwtRegex =  /^ey[A-Za-z0-9-_]+\.ey[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;
        expect(token).toBeDefined();
        expect(jwtRegex.test(token)).toBe(true);
    });
    it('Invalid JWT connection', async () => {
        const client = ioc(socketURL, {
            extraHeaders: {
                token: "token"
            }
        })
        let isConnected = false;
        await Promise.race([
            new Promise( resolve => {
                client.on('connect', () => { isConnected = true })
                client.on('socketapi/user/connection/test', () => {
                    getMsg = true
                })

                client.on('disconnect', () => {
                    isConnected = false
                    resolve()
                })
            }),
            new Promise(resolve => setTimeout(resolve, 500))
        ])
        expect(isConnected).toBe(false)
    })
    it('Valid JWT connection', async () => {
        const token = $auth.createToken({ username: 'testUser', role: 'user' })
        const client = ioc(socketURL, {
            extraHeaders: {
                token: token
            }
        })
        let isConnected = false;
        let msgReceived = false;
        await Promise.race([
            new Promise( resolve => {
                client.on('connect', () => {
                    isConnected = true
                })
                client.emit('socketapi/user/connection/test')
                client.on('socketapi/user/connection/test', () => {
                    msgReceived = true
                    resolve()
                })
            }),
            new Promise(resolve => setTimeout(resolve, 500))
        ])
        expect(isConnected).toBe(true)
        expect(msgReceived).toBe(true)
    })
    it('CLient msg test', async () => {
        let userA = {
            character: { username: 'userA', role: 'user' },
            chat: { userid: 'userA', chatroom: 'room1' },
            msgReceived: false,
            receivedMsg: '',
            joined: false
        }
        let userB = {
            character: { username: 'userB', role: 'user' },
            chat: { userid: 'userB', chatroom: 'room2' },
            msgReceived: false,
            receivedMsg: '',
            joined: false
        }
        let userC = {
            character: { username: 'userC', role: 'user' },
            chat: { userid: 'userC', chatroom: 'room1' },
            msgReceived: false,
            receivedMsg: '',
            joined: false
        }
        let userD = {
            character: { username: 'userD', role: 'user' },
            chat: { userid: 'userD', chatroom: 'room2' },
            msgReceived: false,
            receivedMsg: '',
            joined: false
        }
        let userE = {
            character: { username: 'userE', role: 'user' },
            chat: { userid: 'userE', chatroom: '' },
            msgReceived: false,
            receivedMsg: '',
            joined: false
        }
        let userF = {
            character: { username: 'userF', role: 'user' },
            chat: { userid: 'userF', chatroom: '' },
            msgReceived: false,
            receivedMsg: '',
            joined: false
        }
        let userG = {
            character: { username: 'userG', role: 'user' },
            chat: { userid: 'userG', chatroom: '' },
            msgReceived: false,
            receivedMsg: '',
            joined: false
        }
        let userH = {   
            character: { username: 'userH', role: 'user' },
            chat: { userid: 'userH', chatroom: '' },
            msgReceived: false,
            receivedMsg: '',
            joined: false
        }
        let userAToken = $auth.createToken(userA.character)
        let userBToken = $auth.createToken(userB.character)
        let userCToken = $auth.createToken(userC.character)
        let userDToken = $auth.createToken(userD.character)
        let userEToken = $auth.createToken(userE.character)
        let userFToken = $auth.createToken(userF.character)
        let userGToken = $auth.createToken(userG.character)
        let userHToken = $auth.createToken(userH.character)

        const clientA = ioc(socketURL, {
            extraHeaders: { token: userAToken }
        })
        const clientB = ioc(socketURL, {
            extraHeaders: { token: userBToken }
        })
        const clientC = ioc(socketURL, {
            extraHeaders: { token: userCToken }
        })
        const clientD = ioc(socketURL, {
            extraHeaders: { token: userDToken }
        })
        const clientE = ioc(socketURL, {
            extraHeaders: { token: userEToken }
        })
        const clientF = ioc(socketURL, {
            extraHeaders: { token: userFToken }
        })
        const clientG = ioc(socketURL, {
            extraHeaders: { token: userGToken }
        })
        const clientH = ioc(socketURL, {
            extraHeaders: { token: userHToken }
        })

        let room1 = '';
        let room2 = '';
        let randomRoom1 = '';
        let randomRoom2 = '';
        let matchMatch = await new Promise( async (resolve) => {
            clientA.on('socketapi/user/join/v1', msg => {
                room1 = msg.chatroom
                userA.joined = true
            })
            clientB.on('socketapi/user/join/v1', msg => {
                room2 = msg.chatroom
                userB.joined = true
            })
            clientC.on('socketapi/user/join/v1', msg => {
                userC.joined = true
            })
            clientD.on('socketapi/user/join/v1', msg => {
                userD.joined = true
            })
            clientE.on('socketapi/user/join/v1', msg => {
                randomRoom1 = msg.chatroom
                userE.joined = true
            })
            clientG.on('socketapi/user/join/v1', msg => {
                userG.joined = true
            })
            clientF.on('socketapi/user/join/v1', msg => {
                randomRoom2 = msg.chatroom
                userF.joined = true
            })
            clientH.on('socketapi/user/join/v1', msg => {
                userH.joined = true
            })
            clientA.emit('socketapi/user/join/v1', userA.chat)
            clientB.emit('socketapi/user/join/v1', userB.chat)
            clientC.emit('socketapi/user/join/v1', userC.chat)
            clientD.emit('socketapi/user/join/v1', userD.chat)

            clientE.emit('socketapi/user/join/v1', userE.chat)
            while (!userE.joined) {
                await new Promise(resolve => setTimeout(resolve, 10))
            }
            clientG.emit('socketapi/user/join/v1', userG.chat)
            while (!userG.joined) {
                await new Promise(resolve => setTimeout(resolve, 10))
            }
            clientH.emit('socketapi/user/join/v1', userH.chat)
            while (!userH.joined) {
                await new Promise(resolve => setTimeout(resolve, 10))
            }
            clientF.emit('socketapi/user/join/v1', userF.chat)
            while (!userF.joined) {
                await new Promise(resolve => setTimeout(resolve, 10))
            }

            while (room1 === '' || room2 === '') {
                await new Promise(resolve => setTimeout(resolve, 10))
            }

            clientA.on('msg', msg => {
                userA.msgReceived = true
                userA.receivedMsg = msg
            })
            clientB.on('msg', msg => {
                userB.msgReceived = true
                userB.receivedMsg = msg
            })
            clientC.on('msg', msg => {
                userC.msgReceived = true
                userC.receivedMsg = msg
            })
            clientD.on('msg', msg => {
                userD.msgReceived = true
                userD.receivedMsg = msg
            })
            clientE.on('msg', msg => {
                userE.msgReceived = true
                userE.receivedMsg = msg
            })
            clientF.on('msg', msg => {
                userF.msgReceived = true
                userF.receivedMsg = msg
            })
            clientG.on('msg', msg => {
                userG.msgReceived = true
                userG.receivedMsg = msg
            })
            clientH.on('msg', msg => {
                userH.msgReceived = true
                userH.receivedMsg = msg
            })
            broadcastMessage(ioServer, 'Hello', room1)
            broadcastMessage(ioServer, 'Hello2', room2)
            broadcastMessage(ioServer, 'random1', randomRoom1)
            broadcastMessage(ioServer, 'random2', randomRoom2)

            while (!userA.msgReceived || !userB.msgReceived || !userC.msgReceived || !userD.msgReceived || !userE.msgReceived || !userF.msgReceived || !userG.msgReceived || !userH.msgReceived) {
                await new Promise(resolve => setTimeout(resolve, 10))
            }
            expect(userA.msgReceived).toBe(true)
            expect(userB.msgReceived).toBe(true)
            expect(userC.msgReceived).toBe(true)
            expect(userD.msgReceived).toBe(true)
            expect(userE.msgReceived).toBe(true)
            expect(userF.msgReceived).toBe(true)
            expect(userG.msgReceived).toBe(true)
            expect(userH.msgReceived).toBe(true)
            expect(userA.receivedMsg).toBe('Hello')
            expect(userB.receivedMsg).toBe('Hello2')
            expect(userC.receivedMsg).toBe('Hello')
            expect(userD.receivedMsg).toBe('Hello2')
            expect(userE.receivedMsg).toBe('random1')
            expect(userF.receivedMsg).toBe('random2')
            expect(userG.receivedMsg).toBe('random1')
            expect(userH.receivedMsg).toBe('random2')
            clientA.disconnect()
            clientB.disconnect()
            clientC.disconnect()
            clientD.disconnect()
            clientE.disconnect()
            clientF.disconnect()
            clientG.disconnect()
            clientH.disconnect()
            resolve()
        })

    })
});
