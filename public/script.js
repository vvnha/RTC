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
    audio: false
}).then(stream =>{
    
    addVideoStream(myVideo, stream, 'YOU')
    var vidTrack = stream.getVideoTracks();
    vidTrack.forEach(track => track.enabled = false);

    setTimeout(() => {  vidTrack.forEach(track => track.enabled = true); }, 10000);


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
    // socket.emit('list-users');
    // socket.on('user-list', list => {
    //     console.log(list[0]);
    // })
    // if(tam<2){

    //     tam++;

        //if(tam!=1){

            // original
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


        //}
    // }
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

window.onload = (event) => {
    //alert('ok');
    document.getElementById('shut').onclick = function() {alert('OK')}
};  
