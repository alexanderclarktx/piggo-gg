import { NetManager } from "@piggo-legends/gamertc";
import React, { useEffect, useRef } from "react";
import { NetState } from "../types/NetState";

export type PhoneCallProps = {
  netManager?: NetManager;
  netState: NetState;
  theirMediaStream?: MediaStream;
}

export const PhoneCall = ({ netManager, netState, theirMediaStream }: PhoneCallProps) => {

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

  const sendMedia = async () => {
    // send my video stream
    const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 360 }, audio: true });
    netManager?.sendMedia(stream);

    // render my video stream
    videoMyCameraRef.current && (videoMyCameraRef.current.srcObject = stream);
  }

  return (
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
    <button
      hidden={netState !== "connected"}
      onClick={sendMedia}
      style={{fontSize: "xx-large", verticalAlign: "top"}}
    >📷</button>
  </div>
  );
}
