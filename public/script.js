const socket = io('/');
const videoGrid = document.getElementById('video-grid')
const myVideo = document.createElement('video')

const type = 3;

myVideo.muted = true
const peers = {}
var tam = 0;
var users = [];
var randomName = faker.name.findName();
var nameA = "";

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const myPeer = new Peer();

myPeer.on('open', (id) => {
    socket.emit('join-room', ROOM_ID, id, randomName)
})

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false
}).then(async stream => {

    addVideoStream(myVideo, stream, "YOU")
    var vidTrack = stream.getTracks();
    vidTrack.forEach(track => track.enabled = true);


    // listen others' call
    // myPeer.on('call', async call=>{
    //     // myPeer.on('connection', async function(conn) {
    //     //     conn.on('data', function(data){
    //     //       // Will print 'hi!'
    //     //       console.log(data);
    //     //      return nameA = data;
    //     //     });
    //     // });
    //     call.answer(stream);
    //     console.log(nameA);
    //     const video = document.createElement('video')
    //     call.on('stream', userVideoStream =>{
    //         addVideoStream(video, userVideoStream,nameA)
    //     })
    // })

    // myPeer.on('connection', async function(conn) {
    //     conn.on('data', function(data){
    //         // Will print 'hi!'
    //         console.log(data);
    //         return nameA = data;
    //     });
    // });

    myPeer.on('call', async call => {
        call.answer(stream);
        const name = new Promise(resolve => myPeer.on('connection', function (conn) {
            conn.on('data', function (data) {
                resolve(data);
            });
        }));
        const video = document.createElement('video')
        const userVideoStream = new Promise(resolve => call.on('stream', (userVideoStream) => {
            resolve(userVideoStream)
        }));
        Promise.all([name, userVideoStream]).then((rs) => {
            addVideoStream(video, rs[1], rs[0])
        })
    })

    socket.on('user-connected', (user) => {
        connectToNewUser(user, stream)
    })

    socket.on('user-disconnected', peerId => {
        if (peers[peerId]) peers[peerId].close();

        // optional
        socket.emit('list-users');
        socket.on('user-list', list => {
            users = list;
            console.log(list);
        })
    })

    document.getElementById('shut').onclick = function () {
        vidTrack.forEach(track => track.enabled = !track.enabled);
    }

})

// message
socket.on('message-list', rs => {
    var node = document.createElement("LI");
    var textnode = document.createTextNode(rs);
    node.appendChild(textnode);
    document.getElementById("listMess").appendChild(node);
})

function connectToNewUser(user, stream) {
    const call = myPeer.call(user.peerId, stream)
    socket.emit('list-users');
    var conn = myPeer.connect(call.peer);
    conn.on('open', function () {
        // here you have conn.id
        conn.send(randomName);
    });
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream, user.userName);
    })
    call.on('close', () => {
        video.remove();
    })
    peers[user.peerId] = call
}



const addVideoStream = async (video, stream, peerId) => {
    // var name = "YOU";
    // if ( peerId !== null) name = await getNameUser(peerId);
    const name = peerId;
    const newDiv = document.createElement('div');
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()

        newDiv.setAttribute("id", "Div1");
        newDiv.append(video)

        var p = document.createElement("p");
        p.innerHTML = name;
        newDiv.append(p);
    })
    videoGrid.append(newDiv)
}

//  const getName = (peerId, list)=>{

//     // await socket.emit('list-users');

//     // await socket.on('user-list', async list => {
//     //     const userInfo = await list.filter(peer => peer.peerId === peerId);
//     //     console.log(userInfo);
//     //     return userInfo[0];
//     // })

//     const result = "UNKNOWN";
//     if (list.length > 0){
//         const userInfo = list.filter(peer => peer.peerId === peerId)[0];
//         if (typeof userInfo !== 'undefined'){
//             kq = userInfo.userName;
//             return kq;
//         }
//     }
//     return result;
// }

// const getNameUser = (peerId) => {
//     return new Promise(resolve => {
//         console.log('OK');
//         socket.emit('list-users');
//         socket.on('user-list', async list => {
//             console.log(list);
//             if (list.length > 0){
//                 const userInfo = list.filter(peer => peer.peerId === peerId)[0];
//                 if (typeof userInfo !== 'undefined'){
//                     kq = userInfo.userName;
//                     console.log(kq);
//                     resolve(kq);
//                 }
//             }
//             resolve('UNKNOWN');
//       });      
//     });
//   }


document.getElementById('screen').onclick = function () {
    navigator.mediaDevices.getDisplayMedia({
        video: true
    }).then(screenStream => {
        const video = document.createElement('video')
        addVideoStream(video, screenStream, 'share screen')

        const myPeer = new Peer();
        myPeer.on('open', id => {
            socket.emit('join-room', ROOM_ID, id, 'share screen')
        })

        // listen others' call
        myPeer.on('call', call => {
            call.answer(screenStream)
            // const video = document.createElement('video')
            // call.on('stream', userVideoStream=>{
            //     addVideoStream(video, userVideoStream, call.peer)
            // })
        })

        socket.on('user-connected', (user) => {
            connectToNewUser(user, screenStream)
        })

        socket.on('user-disconnected', peerId => {
            if (peers[peerId]) peers[peerId].close();

            // optional
            socket.emit('list-users');
            socket.on('user-list', list => {
                users = list;
                console.log(list);
            })
        })
    })
}

document.getElementById('sendMess').onclick = () => {
    const mess = document.getElementById('mess').value;
    var node = document.createElement("LI");                 // Create a <li> node
    var textnode = document.createTextNode(randomName + ": " + mess);
    node.appendChild(textnode);
    document.getElementById("listMess").appendChild(node);
    socket.emit('message', randomName, mess);
};