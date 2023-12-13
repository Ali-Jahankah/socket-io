const http = require('http');

const express = require('express');
const {Server} = require('socket.io');

const app = express()
const server = http.createServer(app)
const transports = process.env.NODE_ENV === 'production' ? ['websocket'] : ['polling'];

const io = new Server(server,transports)

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
    socket.on('register', (data) => {
       
        socket.username = data.message
        socket.emit('register', socket.username)
        console.log(`User set to ${socket.username} with ID: ${socket.id}`);
    })
    socket.on('send message', (data) => {
    
        const date = new Date(),
              year = date.getFullYear(),
              month = date.getMonth() + 1,
              day = date.getDate()
              fullDate = `${day}/${month}/${year}`
              hours = date.getHours().toString().padStart(2, '0')
              minutes = date.getMinutes().toString().padStart(2, '0');
              message = {
                text: data,
                user: socket.username,
                date: fullDate,
              }
              formattedMessage = `<li class="li" >
            <h4 class="message-title" >
            <span class="message-span" >${message.user}</span>
            <span class="message-span" >${message.date}</span>
            <span class="message-span" >${hours}:${minutes}</span>
            </h4>
            <p class="message-text" >${message.text}</p>
              </li>`
        io.sockets.emit('send message', formattedMessage)
    })
    socket.on('typing', () => {
        socket.broadcast.emit('typing', socket.username)
    })
})