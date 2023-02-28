import { PeerConfig, RTCPeerConnection } from "werift"

export class WebRTC {
  config: Partial<PeerConfig> = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
  }
  dataChannelSettings = {
    reliable: {
      ordered: true,
      maxRetransmits: 0
    }
  }
  pendingDataChannels = {};
  dataChannels = {};
  pc: RTCPeerConnection;
  offer: string;

  constructor() {
    this.pc = new RTCPeerConnection(this.config);
    this.pc.onsignalingstatechange = () => {
      console.log("signaling state change", this.pc.signalingState);
    }
    this.pc.onconnectionstatechange = () => console.log("connection state change", this.pc.connectionState);
  }

  // make an offer to a peer
  async createOffer(): Promise<string> {
    if (!this.offer) {
      // configure the data channel
      const channel = this.pc.createDataChannel("chat");
      channel.stateChanged.subscribe((state) => {
        console.log("state changed", state);
      });
      channel.onopen = () => {
        console.log("\nConnected!");
      };
      channel.onmessage = (event) => {
        console.log(event);
      };
      channel.onerror = () => console.log("error");

      // create an offer and set local
      const offer = await this.pc.createOffer();
      this.pc.setLocalDescription(offer);
      this.offer = JSON.stringify(offer);
    }
    return this.offer;
  }

  // accept an answer from a peer (after making an offer)
  async acceptAnswer(answer: string) {
    if (!this.offer) {
      throw new Error("Cannot receive answer without making an offer first");
    }
    // set remote
    await this.pc.setRemoteDescription(JSON.parse(answer));
  }

  // accept offer from a peer
  async acceptOffer(offer: string): Promise<string> {
    // parse the offer and set remote
    await this.pc.setRemoteDescription(JSON.parse(offer));

    // configure the data channels
    var labels = Object.keys(this.dataChannelSettings);
    this.pc.ondatachannel = (evt) => {
      var channel = evt.channel;
      var label = channel.label;
      this.pendingDataChannels[label] = channel;

      channel.onopen = () => {
        this.dataChannels[label] = channel;
        delete this.pendingDataChannels[label];
        if (Object.keys(this.dataChannels).length === labels.length) {
          console.log("\nConnected!");
        }
      };
      channel.onmessage = (event) => {
        console.log(event);
      };
      channel.onerror = () => console.log("error");
    };

    // create an answer and set local
    console.log("creating answer");
    const answer = await this.pc.createAnswer();
    console.log("created answer");
    this.pc.setLocalDescription(answer);
    console.log("set local promise");
    return JSON.stringify(answer);
  }
}
