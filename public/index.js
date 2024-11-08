window.onload = () => {
  document.getElementById("my-button").onclick = () => {
    init();
  };
};

async function init() {
  // Capture audio instead of video
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const peer = createPeer();
  stream.getTracks().forEach((track) => peer.addTrack(track, stream));
}

function createPeer() {
  const peer = new RTCPeerConnection({
    iceServers: [
      {
        urls: "stun:192.168.4.1:3478",
      },
    ],
  });
  peer.onnegotiationneeded = () => handleNegotiationNeededEvent(peer);

  return peer;
}

async function handleNegotiationNeededEvent(peer) {
  const offer = await peer.createOffer();
  await peer.setLocalDescription(offer);
  const payload = {
    sdp: peer.localDescription,
  };

  const { data } = await axios.post("/broadcast", payload);
  const desc = new RTCSessionDescription(data.sdp);
  peer.setRemoteDescription(desc).catch((e) => console.log(e));
}
