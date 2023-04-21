const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, getUser, removeUser, getUsersFromRoom } = require("./utils/users");

const PORT = process.env.PORT || 3000;

// server setups
const app = express();
const server = http.createServer(app);
const io = new Server(server);

const publicDirPath = path.join(__dirname, '../public');
app.use(express.static(publicDirPath));

io.on('connection', (socket) => {

    // join chat-room
    socket.on('join', ({ username, room }, callback) => {
        // socket.emit("message", generateMessage("Welcome 🙏🏿"));   // to only self 
        // socket.broadcast.emit("message", generateMessage("A new user has joined 👌"));   // sending to all connection except current connection    

        const { error, user } = addUser({ id: socket.id, username, room });
        if (error) {
            return callback(error);
        }
        socket.join(user.room);
        socket.emit("message", generateMessage(user.username, "🙏"));   // to only self 
        socket.broadcast.to(user.room).emit("message", generateMessage(user.username, `${user.username} has joined`));   // sending to all connections within a spacific room
        const users = getUsersFromRoom(user.room);
        io.to(user.room).emit('roomData', { room: user.room, users })
        callback();
    })

    socket.on('sendMessage', (message, acknowlegment) => {
        if (message.includes("fuck"))
            return acknowlegment("can not send velgure messages!");
        const user = getUser(socket.id);
        io.to(user.room).emit('message', generateMessage(user.username, message));    // to all connections
        acknowlegment("Message has been delivered successfully!");
    })
    socket.on('sendLocation', (location, acknowlegment) => {
        const user = getUser(socket.id)
        io.to(user.room).emit("locationMessage", generateLocationMessage(user.username, `https://google.com/maps?q=${location.lat},${location.long}`));
        acknowlegment('location has sent');
    })
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        const users = getUsersFromRoom(user?.room);
        if (user) {
            io.to(user.room).emit('message', generateMessage(user.username, `A ${user.username} has left!`));
            io.to(user.room).emit('roomData', { room: user.room, users })
        }
    })
})

server.listen(PORT, () => {
    console.log('listening on port' + PORT);
})
