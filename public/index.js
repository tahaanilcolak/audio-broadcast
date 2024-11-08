let stream; // Global değişken olarak tanımlandı
let peer; // Global değişken olarak tanımlandı

window.onload = () => {
  const button = document.getElementById("my-button");
  const recButton = document.getElementById("rec-button");
  const statusMessage = document.getElementById("status-message");
  let isStreaming = false;

  button.onclick = async () => {
    if (!isStreaming) {
      await init();
      isStreaming = true;
      updateUI();
    } else {
      stopStream(); // Yayını durdur
      isStreaming = false;
      updateUI();
    }
  };

  recButton.onclick = async () => {
    if (!isStreaming) {
    } else {
      stopStream(); // Yayını durdur
      isStreaming = false;
      updateUI();
    }
  };

  function updateUI() {
    if (isStreaming) {
      button.style.display = "none";
      button.textContent = "";
      recButton.style.display = "block";
      statusMessage.style.display = "block";
      statusMessage.textContent = "Yayın Yapılıyor";
    } else {
      button.style.display = "block";
      recButton.style.display = "none";
      button.textContent = "Yayını Başlat";
      statusMessage.style.display = "none";
    }
  }
};

async function init() {
  stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  peer = createPeer();
  stream.getTracks().forEach((track) => peer.addTrack(track, stream));
}

function createPeer() {
  const peerConnection = new RTCPeerConnection({
    iceServers: [
      {
        urls: "stun:192.168.4.1:3478",
      },
    ],
  });
  peerConnection.onnegotiationneeded = () =>
    handleNegotiationNeededEvent(peerConnection);

  return peerConnection;
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

function stopStream() {
  // Stream'i durdur
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
  }

  // Peer bağlantısını kapat
  if (peer) {
    peer.close();
    peer = null; // Yeni bir bağlantı gerektiğinde null olarak ayarladık
  }
}
