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
    (offer: string) => {
      console.log("offer", offer);
      setSdp({
        local: btoa(offer),
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
    // console.log("ref", inputRef.current.value);
    const v = atob(inputOfferRef.current ? inputOfferRef.current.value : "");
    console.log("v", v);
    const answer = client.acceptOffer(v);
    answer.then((a) => {
      setSdp({
        local: sdp.local,
        remote: btoa(a)
      });
    });
    setRtcState("answering");
  }

  const acceptAnswer = () => {
    console.log("accept answer", inputAnswerRef.current?.value);
    const v = atob(inputAnswerRef.current ? inputAnswerRef.current.value : "");
    console.log("v", v);
    client.acceptAnswer(v);
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
          <p hidden={rtcState !== "offering"} style={{ wordWrap: "break-word", color: "white", fontSize: "small" }}>{sdp.local}</p>
        </div>
        <div hidden={rtcState === "offering" || rtcState === "connected"}>
          <button hidden={rtcState === "answering"} onClick={acceptOffer}>Accept Offer</button>
          <input hidden={rtcState === "answering"} type="text" ref={inputOfferRef} />
          <p style={{ wordWrap: "break-word", color: "white", fontSize: "small" }}>{sdp.remote}</p>
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
        <video id="video-my-camera" ref={videoMyCameraRef} hidden={rtcState !== "connected"} autoPlay={true} playsInline={true} />
        <video id="video-their-camera" ref={videoTheirCameraRef} hidden={rtcState !== "connected"} autoPlay={true} playsInline={true} />
      </div>
    </div>
  );
}
