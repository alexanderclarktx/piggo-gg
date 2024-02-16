import { Compression } from "@piggo-legends/core";

export class RtcPeer {
  rtcConfig = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] }
  dataChannelSettings = { reliable: { ordered: false, maxRetransmits: 0 } }
  pc: RTCPeerConnection;
  offer: boolean;
  events: EventTarget = new EventTarget();
  chat?: RTCDataChannel = undefined;

  constructor(onLocalUpdated: (offer: string) => void, onConnectedCallback: () => void) {
    this.pc = new RTCPeerConnection(this.rtcConfig);

    this.pc.onsignalingstatechange = () => console.log("signaling state change", this.pc.signalingState);

    this.pc.onconnectionstatechange = (_) => {
      if (this.pc.connectionState === "connected") {
        console.log("connected NOT firefox");
        onConnectedCallback();
      }
    }

    this.pc.onnegotiationneeded = async () => {
      console.log("negotiation needed", this.pc.signalingState);
      if (this.pc.iceConnectionState !== "connected") {
        return;
      }
      try {
        console.log("creating new offer");
        await this.pc.setLocalDescription(await this.pc.createOffer());
        this.sendMessage({ type: "offer", sdp: this.pc.localDescription });
      } catch (err) {
        console.error(err);
      }
    }

    this.pc.ontrack = (evt) => {
      console.log("ontrack");
      console.log(evt.streams);
    };

    this.pc.onicecandidateerror = (evt) => console.log("ice candidate error", evt);

    this.pc.oniceconnectionstatechange = (evt: Event) => {
      console.log("ice connection state change", this.pc.iceConnectionState, evt);
      if (this.pc.iceConnectionState === "connected" && !this.pc.connectionState) {
        console.log("connected firefox");
        onConnectedCallback();
      }
    }

    this.pc.onicegatheringstatechange = async (_) => {
      console.log("ice gathering state change", this.pc.iceGatheringState);
      if (this.pc.iceGatheringState === "complete") {
        const encodedLocal = JSON.stringify(this.pc.localDescription);
        // onLocalUpdated(encodedLocal);
        const sdpList = JSON.stringify(Compression.parseSdp(this.pc.localDescription));
        onLocalUpdated(sdpList);
        this.offer = true;
      }
    }
  }

  _handleMessage = async (message: MessageEvent<any>) => {
    // console.log("received", message);
    const data = JSON.parse(message.data);
    if (data["type"] === "offer") {
      this.pc.setRemoteDescription(data["sdp"]);
      const answer = await this.pc.createAnswer();
      await this.pc.setLocalDescription(answer);
      this.sendMessage({ type: "answer", sdp: answer });
    } else if (data["type"] === "answer") {
      this.pc.setRemoteDescription(data["sdp"]);
    } else {
      this.events.dispatchEvent(new CustomEvent<string>("message", { detail: data }));
    }
  }

  // make an offer to a peer
  createOffer = async () => {
    if (!this.offer) {
      // configure the data channel
      const channel = this.pc.createDataChannel("chat");
      this.chat = channel;

      channel.onopen = () => console.log("\nConnected!");
      channel.onmessage = (event) => this._handleMessage(event);
      channel.onerror = () => console.log("error");

      // kick off ice gathering
      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);
    }
  }

  // accept an answer from a peer (after making an offer)
  acceptAnswer = async (answer: string): Promise<void> => {
    if (!this.offer) {
      throw new Error("Cannot receive answer without making an offer first");
    }
    // set remote
    const constructedSdp: RTCSessionDescriptionInit = {
      type: "answer",
      sdp: Compression.constructSdp(answer)
    };
    this.pc.setRemoteDescription(constructedSdp);
  }

  // accept offer from a peer
  acceptOffer = async (offer: string): Promise<void> => {
    // handle the remote data connection
    this.pc.ondatachannel = (event) => {
      const channel = event.channel;
      // this.dataChannels["chat"] = channel;
      this.chat = channel;
      channel.onopen = () => console.log("\nConnected!");
      channel.onmessage = (event) => this._handleMessage(event);
      channel.onerror = () => console.log("error");
    }

    // parse the offer and set remote
    const constructedSdp: RTCSessionDescriptionInit = {
      type: "offer",
      sdp: Compression.constructSdp(offer)
    };
    await this.pc.setRemoteDescription(constructedSdp);
    // await this.pc.setRemoteDescription(JSON.parse(offer));

    // create an answer and set local
    const answer = await this.pc.createAnswer({
      iceRestart: false
    });
    this.pc.setLocalDescription(answer);
  }

  // send message to peer
  sendMessage = (message: Object): void => {
    if (this.chat && this.chat.readyState === "open") {
      this.chat.send(JSON.stringify(message));
    }
  }

  // send audio/video to peer
  sendMedia = async (stream: MediaStream): Promise<void> => {
    if (this.pc.signalingState !== "stable") {
      throw new Error("not connected");
    }
    stream.getTracks().forEach((track) => {
      this.pc.addTrack(track, stream);
    });
  }
}
