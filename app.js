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
let allOnlineUserObjects = {};
io.on('connection', socket => {
socket.on('app run', () => {
    
    socket.emit('app run', {onlineUsers: Object.values(allOnlineUserObjects)})
})
    socket.on('disconnect', () => {
        delete allOnlineUserObjects[socket.id];
        io.sockets.emit('user disconnect', {onlineUsers:Object.values(allOnlineUserObjects)})
    })
    socket.on('register', (data) => {
        socket.username = data.message
        allOnlineUserObjects[socket.id] = {
            id: socket.id,
            username: data.message
        }
        const onlineUsers = Object.values(allOnlineUserObjects);
        socket.emit('register', {name: socket.username})
        io.sockets.emit('new user', {onlineUsers})
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
              </li>`;
        io.sockets.emit('send message', formattedMessage)
    })
    socket.on('typing', () => {
        socket.broadcast.emit('typing', socket.username)
    })
})