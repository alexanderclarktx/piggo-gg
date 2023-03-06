import { NetManager } from "@piggo-legends/gamertc";
import React, { useEffect, useRef } from "react";
import ReactModal from "react-modal";

export type NetState = "none" | "offering" | "answering" | "connected";

export type WebRTCHandshakeProps = {
  netManager?: NetManager
  sdp: { local: string, remote: string }
  modalOpen: boolean
  setModalOpen: (open: boolean) => void
  netState: NetState
  setNetState: (state: NetState) => void
  theirMediaStream?: MediaStream
}

export const NetConnector = ({ netManager, sdp, modalOpen, setModalOpen, netState, setNetState, theirMediaStream }: WebRTCHandshakeProps) => {
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
    if (netState === "connected") {
      setModalOpen(false);
    }
  }, [netState]);

  const createOffer = () => {
    setNetState("offering");
    netManager?.createOffer();
  }

  const acceptOffer = () => {
    const offerDecoded = atob(inputOfferRef.current ? inputOfferRef.current.value : "");
    netManager?.acceptOffer(offerDecoded);
    setNetState("answering");
  }

  const acceptAnswer = () => {
    const decodedAnswer = atob(inputAnswerRef.current ? inputAnswerRef.current.value : "");
    netManager?.acceptAnswer(decodedAnswer);
  }

  const sendMedia = async () => {
    // send my video stream
    const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 360 }, audio: true });
    netManager?.sendMedia(stream);

    // render my video stream
    videoMyCameraRef.current && (videoMyCameraRef.current.srcObject = stream);
  }

  return (
    <div>
      <div>
        <ReactModal
          isOpen={modalOpen}
          shouldCloseOnOverlayClick={true}
          onRequestClose={()=>setModalOpen(false)}
          style={{
            overlay: {
              backgroundColor: "rgba(0, 0, 0, 0.4)",
            },
            content: {
              backgroundColor: "rgba(70, 70, 70, 0.9)",
              color: "white"
            }
          }}
        >
          <div>
            <div>
              <button hidden={netState !== "none"} onClick={createOffer}>Create Offer</button>
              <p hidden={netState !== "offering" && netState !== "answering"} style={{ wordWrap: "break-word", fontSize: "small" }}>
                {sdp.local}
              </p>
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
        </ReactModal>
      </div>
      <div>
        <button hidden={netState === "connected"} onClick={()=>setModalOpen(true)}>Connect to Peer</button>
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
        <button
          hidden={netState !== "connected"}
          onClick={sendMedia}
          style={{fontSize: "xx-large", verticalAlign: "top"}}
        >📷</button>
      </div>
    </div>
  );
}
