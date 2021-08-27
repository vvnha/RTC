const express = require('express');
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server, {
    cors: {
        origin: '*',
    }
});
const { v4: uuidV4 } = require('uuid');

app.set('view engine', 'ejs');
app.use(express.static('public'))

app.get('/', (req, res) => {
    res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
    console.log(
        'ok'
    );
    res.render('room', { roomId: req.params.room })
})

var users = {}
const socketToRoom = {};

io.on('connection', socket => {
    socket.on('join-room', (roomId, peerId, userName) => {

        //optional
        if (users[roomId]) {
            users[roomId].push({ peerId, userName });
        } else {
            users[roomId] = [{ peerId, userName }];
        }
        socketToRoom[socket.id] = roomId;
        console.log(users[roomId]);
        //__________

        socket.join(roomId)
        socket.broadcast.to(roomId).emit('user-connected', { peerId, userName })
        socket.on('disconnect', () => {

            //optional
            let room = users[roomId];
            if (room) {
                room = room.filter(item => item.peerId !== peerId);
                users[roomId] = room;
            }
            console.log(users[roomId]);
            //_____

            socket.broadcast.to(roomId).emit('user-disconnected', peerId)


        })

        socket.on('message', (userName, message) => {
            socket.in(roomId).emit('message-list', userName + ': ' + message)
        })

        socket.on('list-users', () => {
            socket.broadcast.to(roomId).emit('user-list', users[roomId])
        })
    })
})

server.listen(process.env.PORT || 5000, () => console.log(`server is running on port 5000 or ${process.env.PORT}`));
