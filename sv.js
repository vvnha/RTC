const express = require('express');
const app = express()
const server = require('http').Server(app)
const io = require("socket.io")(server);
const {v4: uuidV4} = require('uuid');

app.set('view engine', 'ejs');
app.use(express.static('public'))

app.get('/', (req,res)=>{
    res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req,res)=>{
    res.render('room', {roomId: req.params.room})
})

var users = {}
const socketToRoom = {};

io.on('connection',socket =>{
    socket.on('join-room', (roomId, userId) =>{

         //optional
        if (users[roomId]) {
            users[roomId].push(userId);
        } else {
            users[roomId] = [userId];
        }
        socketToRoom[socket.id] = roomId;
        console.log(users[roomId]);
        //__________

        socket.join(roomId)
        socket.broadcast.to(roomId).emit('user-connected', userId)
        socket.on('disconnect', ()=>{

            //optional
            let room = users[roomId];
            if (room) {
                room = room.filter(id => id !== userId);
                users[roomId] = room;
            }
            console.log(users[roomId]);
            //_____

            socket.broadcast.to(roomId).emit('user-disconnected', userId)
            
            
        })

        socket.on('list-users', ()=>{
            socket.broadcast.to(roomId).emit('user-list', users[roomId])
        })
    })
} )

server.listen(process.env.PORT || 5000, () => console.log('server is running on port 5000'));
