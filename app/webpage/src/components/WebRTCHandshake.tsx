import { WebRTC } from "@piggo-legends/gamertc";
import React, { useEffect, useRef, useState } from "react";

export const WebRTCHandshake = () => {

  const inputOfferRef = useRef<HTMLInputElement>(null);
  const inputAnswerRef = useRef<HTMLInputElement>(null);
  const videoMyCameraRef = useRef<HTMLVideoElement>(null);
  const videoTheirCameraRef = useRef<HTMLVideoElement>(null);

  const [sdp, setSdp] = useState({
    local: "",
    remote: ""
  });

  const [rtcState, setRtcState] = useState<"none" | "offering" | "answering" | "connected">("none");

  const [client] = useState(new WebRTC(
    (local: string) => {
      console.log("updated local", local);
      setSdp({
        local: btoa(local),
        remote: sdp.remote
      });
    },
    (stream: MediaStream) => {
      console.log("got media");
      videoTheirCameraRef.current && (
        videoTheirCameraRef.current.hidden = false,
        videoTheirCameraRef.current.srcObject = stream
      );
    },
    () => {
      console.log("connected!");
      setRtcState("connected");
    }
  ));

  useEffect(() => {
    window["client"] = client;
    console.log("update sdp");
  }, [sdp.local, sdp.remote]);

  const createOffer = () => {
    console.log("send offer");
    setRtcState("offering");
    client.createOffer();
  }

  const acceptOffer = () => {
    console.log("accept offer");
    const offerDecoded = atob(inputOfferRef.current ? inputOfferRef.current.value : "");
    client.acceptOffer(offerDecoded);
    setRtcState("answering");
  }

  const acceptAnswer = () => {
    const decodedAnswer = atob(inputAnswerRef.current ? inputAnswerRef.current.value : "");
    client.acceptAnswer(decodedAnswer);
  }

  const sendMedia = async () => {
    // send my video stream
    console.log("send media");
    const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 360 }, audio: true });
    console.log(stream);
    client.sendMedia(stream);

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
