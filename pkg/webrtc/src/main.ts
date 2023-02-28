import { RTCPeerConnection, RTCSessionDescription } from "werift"
import { createInterface } from "readline";

var rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

const config = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  optional: [{ DtlsSrtpKeyAgreement: false }]
}

const dataChannelSettings = {
  "reliable": {
    ordered: true,
    maxRetransmits: 0
  },
}

var pendingDataChannels = {};
var dataChannels = {};

function inputLoop(channel) {
  rl.question("> ", (text) => {
    channel.send(JSON.stringify({ message: text }));
    inputLoop(channel);
  });
}

function doHandleDataChannels(pc: RTCPeerConnection, offer: RTCSessionDescription) {
  var labels = Object.keys(dataChannelSettings);
  pc.ondatachannel = (evt) => {
    var channel = evt.channel;
    var label = channel.label;
    pendingDataChannels[label] = channel;

    channel.onopen = () => {
      dataChannels[label] = channel;
      delete pendingDataChannels[label];
      if (Object.keys(dataChannels).length === labels.length) {
        console.log("\nConnected!");
        inputLoop(channel);
      }
    };
    channel.onmessage = (event) => {
      console.log(event);
      inputLoop(channel);
    };
    channel.onerror = () => console.log("error");
  };

  const setRemote = pc.setRemoteDescription({ type: "offer", sdp: JSON.parse(JSON.stringify(offer.sdp))["sdp"] });
  setRemote.then(() => {
    console.log("remoteDescription", pc.remoteDescription);
    pc.createAnswer().then((answer: RTCSessionDescription) => {
      console.log("answer", JSON.stringify(answer));
      pc.setLocalDescription(answer);
    });
  });
}

function getOffer(pastedOffer) {
  const data = JSON.parse(pastedOffer);
  const offer = new RTCSessionDescription(data, "offer");

  const pc = new RTCPeerConnection(config);
  pc.onsignalingstatechange = () => {
    console.log("signaling state change", pc.signalingState);
  }
  pc.onconnectionstatechange = () => console.log("connection state change", pc.connectionState);

  doHandleDataChannels(pc, offer);
}

// a datachannel must be made before making the offer
function makeDataChannel(pc: RTCPeerConnection) {

  var channel = pc.createDataChannel("chat");

  channel.stateChanged.subscribe((state) => {
    console.log("state changed", state);
  });

  channel.onopen = () => {
    console.log("\nConnected!");
    inputLoop(channel);
  };

  channel.onmessage = (event) => {
    console.log(event);
    inputLoop(channel);
  };

  channel.onerror = () => console.log("error");
}

function getAnswer(pastedAnswer, pc: RTCPeerConnection) {
  const data = JSON.parse(pastedAnswer);
  pc.setRemoteDescription(data);
}

function makeOffer() {
  const pc = new RTCPeerConnection(config);
  makeDataChannel(pc);

  pc.onsignalingstatechange = () => console.log("signaling state change", pc.signalingState);
  pc.onconnectionstatechange = () => {
    console.log("connection state change", pc.connectionState);
    if (pc.connectionState == "failed") {
      console.log(pc);
    }
  }

  const offer = pc.createOffer();
  offer.then((offer) => {
    console.log("offer", JSON.stringify(offer));
    pc.setLocalDescription({ type: "offer", sdp: offer.sdp });
    rl.question("Please paste your answer:\n", (answer) => {
      getAnswer(answer, pc);
    });
  });
}

if (process.argv[2] == "--create") {
  makeOffer();
}
else {
  rl.question("Please paste your offer:\n", (offer) => {
    getOffer(offer);
  });
}
