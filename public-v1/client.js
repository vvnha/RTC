
//const Peer = require('simple-peer');
const roomID = "abc-dd";
var peersRef = [];
var socket = io.connect("http://localhost:8000");

window.onload = () => {
    //document.getElementById('my-button').onclick = () => {
        init();
        //console.log(peersRef);
    //}
}

//const [peers, setPeers] = useState([]);

const init = async function() {
    // socket.on('connect', function(data){
    //     socket.emit('join', 'Hello' );
    // })
    navigator.mediaDevices.getUserMedia({ video: true}).then(stream => {
        //console.log(stream);
        
        document.getElementById("video1").srcObject = stream;
        socket.emit("join room", roomID);

        socket.on("all users", users => {
            const peers = [];
            users.forEach(userID => {
                const peer = createPeer(userID, socket.id, stream);
                    peersRef.push({
                        peerID: userID,
                        peer,
                    })
                peers.push(peer);
                console.log(peer._remoteStreams);
            });
            console.log(users);
            //peers.forEach(item=>console.log(item.peer.streams))
        })

        socket.on("user joined", payload => {
            const peer = addPeer(payload.signal, payload.callerID, stream);
            peersRef.push({
                peerID: payload.callerID,
                peer,
            })

        });
        socket.on("room full", ()=>{
            alert("full");
        });
        socket.on("receiving returned signal", payload => {
            const item = peersRef.find(p => p.peerID === payload.id);
            item.peer.signal(payload.signal);
        });
    })
}
function createPeer(userToSignal, callerID, stream) {
    const peer = new SimplePeer({
        initiator: true,
        trickle: false,
        stream,
    });
    peer.on("signal", signal => {
        console.log(signal);
        //peer.ontrack = (e)=>{console.log(e.streams)};
        socket.emit("sending signal", { userToSignal, callerID, signal })
    })
    return peer;
}
function addPeer(incomingSignal, callerID, stream) {
    const peer = new SimplePeer({
        initiator: false,
        trickle: false,
        stream,
    })

    peer.on("signal", signal => {
        console.log(signal);
        socket.emit("returning signal", { signal, callerID })
    })

    peer.signal(incomingSignal);

    return peer;
}