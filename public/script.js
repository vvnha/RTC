const socket = io('/');
const videoGrid = document.getElementById('video-grid')
const myVideo = document.createElement('video')
const type = 3;

myVideo.muted = true
const peers = {}
var tam = 0;
var users = [];

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

navigator.mediaDevices.getUserMedia({
    video : true,
    audio: true
}).then(stream =>{
    
    addVideoStream(myVideo, stream, 'YOU')
    var vidTrack = stream.getTracks();
    vidTrack.forEach(track => track.enabled = true);

    // listen others' call
    myPeer.on('call', call=>{
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream=>{
            addVideoStream(video, userVideoStream, call.peer)
        })
    })

    socket.on('user-connected', userId=> {
        connectToNewUser(userId, stream)
    })

    socket.on('user-disconnected', userId =>{
        if(peers[userId]) peers[userId].close();

        // optional
        socket.emit('list-users');
        socket.on('user-list', list => {
            users = list;
            console.log(list);
        })
    })

    document.getElementById('shut').onclick = function() {
        vidTrack.forEach(track => track.enabled = false);
    }

})

const myPeer = new Peer();
myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream){
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream, userId);
    })
    call.on('close', ()=>{
        video.remove();
    })
    peers[userId] = call
}



function addVideoStream(video, stream, userId) {
    const newDiv = document.createElement('div');
        video.srcObject = stream
        video.addEventListener('loadedmetadata', () => {
            video.play()
    
            newDiv.setAttribute("id", "Div1");
            newDiv.append(video)
    
            var p = document.createElement("p");
            p.innerHTML = userId
            newDiv.append(p);
        })
    videoGrid.append(newDiv)
}

 addName = ()=>{
    var kq = []
    socket.emit('list-users');
    socket.on('user-list', list => {
        users = list;
        console.log(list);
        return list[0];
    })
    return kq;
}


document.getElementById('screen').onclick = function() {
    navigator.mediaDevices.getDisplayMedia({
        video : true
    }).then(stream =>{
        const video = document.createElement('video')
        addVideoStream(video, stream, 'share screen')

        const myPeer = new Peer();
        myPeer.on('open', id => {
            socket.emit('join-room', ROOM_ID, id)
        })
    
        // listen others' call
        myPeer.on('call', call=>{
            call.answer(stream)
            // const video = document.createElement('video')
            // call.on('stream', userVideoStream=>{
            //     addVideoStream(video, userVideoStream, call.peer)
            // })
        })
    
        socket.on('user-connected', userId=> {
            connectToNewUser(userId, stream)
        })
    
        socket.on('user-disconnected', userId =>{
            if(peers[userId]) peers[userId].close();
    
            // optional
            socket.emit('list-users');
            socket.on('user-list', list => {
                users = list;
                console.log(list);
            })
        })
    
        document.getElementById('shut').onclick = function() {
            vidTrack.forEach(track => track.enabled = false);
        }
    
    })
}
