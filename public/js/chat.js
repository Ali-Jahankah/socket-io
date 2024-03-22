const socket = io(window.location.origin, { transports: ['websocket'], upgrade: false })
const registerSection = document.getElementsByClassName('register-section')[0],
    messageSection = document.getElementsByClassName('message-section')[0],
    messagesList = document.getElementsByClassName('message-list')[0],
    usernameText = document.getElementsByClassName('username-text')[0],
    typingSpan = document.getElementsByClassName('typing-span')[0],
    registerForm = document.getElementById('registerForm'),
    messageForm = document.getElementById('messageForm'),
    usernameInput = document.getElementsByClassName('username-input')[0],
    messageInput = document.getElementsByClassName('message-input')[0],
    registerButton = document.getElementsByClassName('register-btn')[0],
    onlineUsers = document.getElementsByClassName('member-tbody')[0],
    userTableTitle = document.getElementsByClassName('member-title')[0],
    lobbyUsers = document.getElementsByClassName('lobby_users')[0],
    messageButton = document.getElementsByClassName('message-btn')[0],
    onlineUsersDiv = document.getElementsByClassName('online-users-div')[0],
    showUser = document.getElementById('showUsers');
    showUser.addEventListener('click', (e)=>onlineUsersDiv.classList.toggle('hide-users'))
const setUsers = (data) => {
    userTableTitle.innerHTML = 'Online'
    onlineUsers.innerHTML = null
    let self = data.onlineUsers.length && data.onlineUsers.find(person => person.id === socket.id);
    if(self){
        self = self.username
    }
    for (const user of data.onlineUsers) {
        const newUser = `<tr class="online_user_tr" data-id="${user.id}" data-username="${user.username}"><td>${user.username}</td></tr>`;
        onlineUsers.innerHTML += newUser
    }
    const onlineUserRows = document.querySelectorAll('.online_user_tr');
    if(self){
        onlineUserRows.forEach(row => {
            row.addEventListener('click', () => {
              if(socket.id !== row.dataset.id){
                const DirectMessageData = {
                    from: self,
                    fromId: socket.id,
                    to: row.dataset.username,
                    toId: row.dataset.id
                }
                testFunction(DirectMessageData)
              } 
            });
        });
    }

    showUser.innerHTML = 'Users <br/>' + data.onlineUsers.length
}
const testFunction = (data) => {
socket.emit('directMessage',data);
}
socket.emit('app run', { id: socket.id })
socket.on('app run', (data) => {
    setUsers(data)
})
registerForm.addEventListener('submit', (e) => {
    e.preventDefault()
    if (usernameInput.value) {
        socket.emit('register', {
            message: usernameInput.value
        })
        registerSection.classList.add('hide')
        messageSection.classList.remove('hide')
        usernameText.classList.remove('hide')
        typingSpan.innerText = ""
    }
})
socket.on('register', (data) => {
    usernameText.innerText = data.name
})
socket.on('new user', data => {
    setUsers(data)
})
socket.on('user disconnect', (data) => {
    setUsers(data)
})
messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    if (messageInput.value) {
        socket.emit('send message', messageInput.value)
        messageInput.value = ""
    }
}
)
socket.on('send message', (data) => handleMessages(data))
messageInput.addEventListener('input', () => {
    if (messageInput.value.trim() !== '') {
        socket.emit('typing');
    }
})
socket.on('typing', (data) => {
    typingSpan.classList.remove('hide')
    typingSpan.innerHTML = `<em> ${data} is typing... </em>`
})
socket.on('directMessage',(data)=>handleMessages(data,'directMessage'))
const handleMessages = (data,classes) =>{
    const formattedMessage = `<li class="${classes} message-li ${socket.id === data.user_id ? 'self-message' : ''}" >
    <h4 class="message-title" >
    <span class="message-span" >${socket.id === data.user_id ? 'You' : data.user}</span>
    <span class="message-span" >${data.date}</span>
    <span class="message-span" >${data.time}</span>
    </h4>
    <p class="message-text" >${data.text}</p>
      </li>`;
        messagesList.innerHTML += formattedMessage
        typingSpan.innerHTML = ""
        typingSpan.classList.add('hide')
        messagesList.scrollTop = 1e9
}