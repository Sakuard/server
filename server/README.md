client -> auth -> roomMatch -> roomJoin -> chat

1. auth -> POST '/auth/service/user/v1'
2. roomMatch -> POST '/service/user/match/v1'
3. roomJoin -> Socket 'socketapi/user/join/v1' -> create MQ channel
4. chat -> POST '/service/user/chat/v1' -> msg to MQ
5. server consume msg from MQ -> broadcast to socket