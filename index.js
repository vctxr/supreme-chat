const express = require('express')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)

const PORT = process.env.PORT || 3000

let userCount = 0

app.use(express.static(__dirname + '/public'))

app.get('/', (req, res) => {
    res.sendFile('index.html')
})

io.on('connection', socket => {   
    socket.on('user-joined', username => {
        console.log('Server detected user joined: ' + username + ' 👋')

        userCount += 1
        socket.username = username

        io.emit('server-notify-user-joined', {
            userCount: userCount, 
            username: username
        })
    })

    socket.on('client-sent', data => {
        console.log('Server received message: ' + data.message)

        socket.broadcast.emit('server-sent', {
            message: data.message,
            username: socket.username,
            userColor: data.userColor
        })
    })

    socket.on('disconnect', () => {
        if (socket.username === null || socket.username === undefined) {
            return
        }

        if (userCount > 0) {
            console.log('User disconnected: ' + socket.username + ' 🍂')
            userCount -= 1
            
            io.emit('server-notify-user-left', {
                userCount: userCount, 
                username: socket.username
            })
        }
    })
})

http.listen(PORT, () => {
    console.log('Listening on port: ' + PORT + ' 🦋')
})