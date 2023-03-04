import { GameRTC } from "@piggo-legends/gamertc";
import React, { useEffect, useRef } from "react";

export type WebRTCHandshakeProps = {
  gameRTC?: GameRTC,
  sdp: { local: string, remote: string },
  setSdp: (sdp: { local: string, remote: string }) => void,
  rtcState: "none" | "offering" | "answering" | "connected",
  setRtcState: (state: "none" | "offering" | "answering" | "connected") => void,
  theirMediaStream?: MediaStream
}

export const WebRTCHandshake = ({gameRTC, sdp, setSdp, rtcState, setRtcState, theirMediaStream}: WebRTCHandshakeProps) => {
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
    window["gamertc"] = gameRTC;
    console.log("update sdp");
  }, [sdp.local, sdp.remote]);

  const createOffer = () => {
    console.log("send offer");
    setRtcState("offering");
    gameRTC?.net.createOffer();
  }

  const acceptOffer = () => {
    console.log("accept offer");
    const offerDecoded = atob(inputOfferRef.current ? inputOfferRef.current.value : "");
    gameRTC?.net.acceptOffer(offerDecoded);
    setRtcState("answering");
  }

  const acceptAnswer = () => {
    const decodedAnswer = atob(inputAnswerRef.current ? inputAnswerRef.current.value : "");
    gameRTC?.net.acceptAnswer(decodedAnswer);
  }

  const sendMedia = async () => {
    // send my video stream
    console.log("send media");
    const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 360 }, audio: true });
    console.log(stream);
    gameRTC?.net.sendMedia(stream);

    // render my video stream
    videoMyCameraRef.current && (videoMyCameraRef.current.srcObject = stream);
  }

  return (
    <div>
      <div>
        <div>
          <button hidden={rtcState !== "none"} onClick={createOffer}>Create Offer</button>
          <p hidden={rtcState !== "offering" && rtcState !== "answering"} style={{ wordWrap: "break-word", color: "white", fontSize: "small" }}>{sdp.local}</p>
        </div>
        <div hidden={rtcState === "offering" || rtcState === "connected"}>
          <button hidden={rtcState === "answering"} onClick={acceptOffer}>Accept Offer</button>
          <input hidden={rtcState === "answering"} type="text" ref={inputOfferRef} />
        </div>
        <div hidden={rtcState !== "offering"}>
          <button onClick={acceptAnswer}>Accept Answer</button>
          <input type="text" ref={inputAnswerRef} />
        </div>
      </div>
      <div>
        <button hidden={rtcState !== "connected"} onClick={sendMedia}>Send Media</button>
      </div>
      <div>
        <video
          id="video-my-camera"
          ref={videoMyCameraRef}
          hidden={rtcState !== "connected"}
          autoPlay={true}
          playsInline={true}
          muted={true}
        />
        <video
          id="video-their-camera"
          ref={videoTheirCameraRef}
          hidden={rtcState !== "connected"}
          autoPlay={true}
          playsInline={true}
        />
      </div>
    </div>
  );
}
