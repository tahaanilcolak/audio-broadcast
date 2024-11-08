const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const webrtc = require("wrtc");

let senderStream;

app.set("view engine", "ejs"); // EJS'yi view engine olarak ayarlayın
app.set("views", __dirname + "/views"); // views klasörünü ayarla
app.use(express.static("public")); // Statik dosyalar için public klasörünü kullan

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("index"); // views/index.ejs dosyasını render eder
});

// Dinleyici sayfası rotası
app.get("/rehber", (req, res) => {
  res.render("rehber"); // views/viewer.ejs dosyasını render eder
});

app.post("/consumer", async ({ body }, res) => {
  try {
    const peer = new webrtc.RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:127.0.0.1:3478", //stun:stun.stunprotocol.org
        },
      ],
    });
    const desc = new webrtc.RTCSessionDescription(body.sdp);
    await peer.setRemoteDescription(desc);

    senderStream
      .getTracks()
      .forEach((track) => peer.addTrack(track, senderStream));

    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);

    const payload = {
      sdp: peer.localDescription,
    };

    res.json(payload);
  } catch (error) {
    console.error("Error in /consumer:", error);
    res.status(500).json({ error: "Failed to create consumer connection." });
  }
});

app.post("/broadcast", async ({ body }, res) => {
  try {
    const peer = new webrtc.RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:192.168.4.1:3478", //stun:stun.stunprotocol.org
        },
      ],
    });

    peer.ontrack = (e) => handleTrackEvent(e, peer);

    const desc = new webrtc.RTCSessionDescription(body.sdp);
    await peer.setRemoteDescription(desc);

    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);

    const payload = {
      sdp: peer.localDescription,
    };

    res.json(payload);
  } catch (error) {
    console.error("Error in /broadcast:", error);
    res.status(500).json({ error: "Failed to create broadcast connection." });
  }
});

function handleTrackEvent(e, peer) {
  try {
    senderStream = e.streams[0];
  } catch (error) {
    console.error("Error in handleTrackEvent:", error);
  }
}

app.listen(3000, () => console.log("server started"));
