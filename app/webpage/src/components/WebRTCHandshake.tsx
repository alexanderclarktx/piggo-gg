import { GameClient } from "@piggo-legends/gamertc";
import React, { useEffect, useRef } from "react";

export type NetState = "none" | "offering" | "answering" | "connected";

export type WebRTCHandshakeProps = {
  gameClient?: GameClient,
  sdp: { local: string, remote: string },
  setSdp: (sdp: { local: string, remote: string }) => void,
  netState: NetState,
  setNetState: (state: NetState) => void,
  theirMediaStream?: MediaStream
}

export const WebRTCHandshake = ({gameClient, sdp, setSdp, netState, setNetState, theirMediaStream}: WebRTCHandshakeProps) => {
  const inputOfferRef = useRef<HTMLInputElement>(null);
  const inputAnswerRef = useRef<HTMLInputElement>(null);
  const videoMyCameraRef = useRef<HTMLVideoElement>(null);
  const videoTheirCameraRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (theirMediaStream) {
      videoTheirCameraRef.current && (
        videoTheirCameraRef.current.hidden = false,
        videoTheirCameraRef.current.srcObject = theirMediaStream
      );
    }
  }, [theirMediaStream]);

  useEffect(() => {
    window["gamertc"] = gameClient;
  }, [sdp.local, sdp.remote]);

  const createOffer = () => {
    setNetState("offering");
    gameClient?.net.createOffer();
  }

  const acceptOffer = () => {
    const offerDecoded = atob(inputOfferRef.current ? inputOfferRef.current.value : "");
    gameClient?.net.acceptOffer(offerDecoded);
    setNetState("answering");
  }

  const acceptAnswer = () => {
    const decodedAnswer = atob(inputAnswerRef.current ? inputAnswerRef.current.value : "");
    gameClient?.net.acceptAnswer(decodedAnswer);
  }

  const sendMedia = async () => {
    // send my video stream
    const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 360 }, audio: true });
    gameClient?.net.sendMedia(stream);

    // render my video stream
    videoMyCameraRef.current && (videoMyCameraRef.current.srcObject = stream);
  }

  return (
    <div>
      <div>
        <div>
          <button hidden={netState !== "none"} onClick={createOffer}>Create Offer</button>
          <p hidden={netState !== "offering" && netState !== "answering"} style={{ wordWrap: "break-word", color: "white", fontSize: "small" }}>{sdp.local}</p>
        </div>
        <div hidden={netState === "offering" || netState === "connected"}>
          <button hidden={netState === "answering"} onClick={acceptOffer}>Accept Offer</button>
          <input hidden={netState === "answering"} type="text" ref={inputOfferRef} />
        </div>
        <div hidden={netState !== "offering"}>
          <button onClick={acceptAnswer}>Accept Answer</button>
          <input type="text" ref={inputAnswerRef} />
        </div>
      </div>
      <div>
        <button hidden={netState !== "connected"} onClick={sendMedia}>Send Media</button>
      </div>
      <div>
        <video
          id="video-my-camera"
          ref={videoMyCameraRef}
          hidden={netState !== "connected"}
          autoPlay={true}
          playsInline={true}
          muted={true}
        />
        <video
          id="video-their-camera"
          ref={videoTheirCameraRef}
          hidden={netState !== "connected"}
          autoPlay={true}
          playsInline={true}
        />
      </div>
    </div>
  );
}
