const http = require('http');

const express = require('express');
const {Server} = require('socket.io');

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.use(express.static('public'))
const PORT = process.env.PORT || 3001

server.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
})
io.on('connection', socket => {
    console.log(`<<< User with ID: ${socket.id} connected! >>>`)

    socket.on('disconnect', () => {
        console.log(`<<< User with ID: ${socket.id} is disconnected! :( >>>`)
    })
})