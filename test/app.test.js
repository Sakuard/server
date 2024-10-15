import { describe, it, expect } from 'vitest'
import { io } from 'socket.io-client'
import axios from 'axios'

let token = ''
const socketURL = 'http://localhost:3000'

describe('Try JWT authentication', () => {
    it('Receive a JWT', async () => {
        let res = await axios.post('http://localhost:3000/api/user/auth/v1', {
            username: 'test',
            role: 'user'
        })
        token = res.data.token
        const jwtRegex =  /^ey[A-Za-z0-9-_]+\.ey[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;
        expect(res.data.token).toBeDefined()
        expect(jwtRegex.test(res.data.token)).toBe(true)
    })
})

describe('Socket Server Auth Connection Test', () => {
    it('Invalid JWT connection', async () => {
        const socket = io(socketURL, {
            extraHeaders: {
                token: "token"  // 使用無效的 token
            }
        });
        let isDisconnected = false;

        await Promise.race([
            new Promise((resolve) => {
                socket.on('connect', () => {
                });

                socket.on('disconnect', (reason) => {
                    isDisconnected = true;
                    resolve();  // 確保測試能完成
                });
            }),
            new Promise((resolve) => setTimeout(resolve, 200)) // 減少等待時間
        ]);

        expect(isDisconnected).toBe(true);  // 確保斷開連線
    });
    it('Valid JWT connection', async () => {
        const socket = io(socketURL, {
            extraHeaders: {
                token: token
            }
        });
        let isConnected = false
        await Promise.race([
            new Promise(resolve => {
                socket.on('connect', () => {})
                socket.emit('socketapi/user/connection/test')
                socket.on('socketapi/user/connection/test', () => {
                    isConnected = true
                    resolve()
                })
            }),
            new Promise((resolve) => setTimeout(resolve, 500)) // 減少等待時間
        ])
        expect(isConnected).toBe(true)
    })
});

describe('Try socket message', () => {
    it('Message send and receive', async () => {
        let AData = {
            character: {
                username: 'userA',
                role: 'user'
            },
            chat: {
                userid: 'userA',
                chatroom: 'room1'
            },
            msgReceived: false
        }
        let BData = {
            character: {
                username: 'userB',
                role: 'user'
            },
            chat: {
                userid: 'userB',
                chatroom: 'room1'
            },
            msgReceived: false
        }
        let CData = {
            character: {
                username: 'userC',
                role: 'user'
            },
            chat: {
                userid: 'userC',
                chatroom: ''
            },
            msgReceived: false
        }
        let DData = {
            character: {
                username: 'userD',
                role: 'user'
            },
            chat: {
                userid: 'userD',
                chatroom: ''
            },
            msgReceived: false
        }

        let tokenA = (await axios.post('http://localhost:3000/api/user/auth/v1', AData.character)).data.token
        let tokenB = (await axios.post('http://localhost:3000/api/user/auth/v1', BData.character)).data.token
        let tokenC = (await axios.post('http://localhost:3000/api/user/auth/v1', CData.character)).data.token
        let tokenD = (await axios.post('http://localhost:3000/api/user/auth/v1', DData.character)).data.token
        const ClientA = io(socketURL, {
            extraHeaders: {
                token: tokenA
            }
        })
        const ClientB = io(socketURL, {
            extraHeaders: {
                token: tokenB
            }
        })
        const ClientC = io(socketURL, {
            extraHeaders: {
                token: tokenC
            }
        })
        const ClientD = io(socketURL, {
            extraHeaders: {
                token: tokenD
            }
        })
        let matchMatch = await new Promise( resolve => {
            ClientA.on('socketapi/user/join/v1', msg => {
                resolve(msg.chatroom)
            })
            ClientA.emit('socketapi/user/join/v1', AData.chat)
            ClientB.emit('socketapi/user/join/v1', BData.chat)
        })
        let ramdomMatch= await new Promise(resolve => {
            ClientC.on('socketapi/user/join/v1', msg => {
                resolve(msg.chatroom)
            })
            ClientD.on('socketapi/user/join/v1', msg => {
                resolve(msg.chatroom)
            })
            ClientC.emit('socketapi/user/join/v1', CData.chat)
            ClientD.emit('socketapi/user/join/v1', DData.chat)
        })
        await Promise.race([
            new Promise(async (resolve) => {
                ClientA.on('msg', (msg) => {
                    expect(msg).toBe('Hello')
                    AData.msgReceived = true
                })
                ClientB.on('msg', (msg) => {
                    expect(msg).toBe('Hello')
                    BData.msgReceived = true
                })
                let response = await axios.post(`${socketURL}/api/user/chat/v1`, {
                    msg: 'Hello',
                    chatroom: matchMatch
                })

                while (!AData.msgReceived || !BData.msgReceived) {
                    await new Promise(resolve => setTimeout(resolve, 10))
                }
                resolve()
            }),
            new Promise((resolve) => setTimeout(resolve, 200)) // 減少等待時間
        ])
        await Promise.race([
            new Promise(async (resolve) => {
                ClientC.on('msg', (msg) => {
                    expect(msg).toBe('random1')
                    CData.msgReceived = true
                })
                ClientD.on('msg', (msg) => {
                    expect(msg).toBe('random1')
                    DData.msgReceived = true
                })
                let response = await axios.post(`${socketURL}/api/user/chat/v1`, {
                    msg: 'random1',
                    chatroom: ramdomMatch
                })
                while (!CData.msgReceived || !DData.msgReceived) {
                    await new Promise(resolve => setTimeout(resolve, 10))
                }
                resolve()
            }),
            new Promise((resolve) => setTimeout(resolve, 200)) // 減少等待時間
        ])
        expect(AData.msgReceived).toBe(true)
        expect(BData.msgReceived).toBe(true)
        expect(CData.msgReceived).toBe(true)
        expect(DData.msgReceived).toBe(true)
        ClientA.disconnect()
        ClientB.disconnect()
        ClientC.disconnect()
        ClientD.disconnect()
    })
})
