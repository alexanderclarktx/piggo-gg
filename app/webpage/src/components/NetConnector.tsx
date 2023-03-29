import { NetManager } from "@piggo-legends/gamertc";
import React, { useEffect, useRef } from "react";
import ReactModal from "react-modal";
import { NetState } from "../types/NetState";

export type WebRTCHandshakeProps = {
  netManager?: NetManager
  sdp: { local: string, remote: string }
  modalOpen: boolean
  setModalOpen: (open: boolean) => void
  netState: NetState
  setNetState: (state: NetState) => void
}

// the NetConnector component is responsible for creating and accepting offers and answers
// and renders the remote+local video streams
export const NetConnector = ({ netManager, sdp, modalOpen, setModalOpen, netState, setNetState }: WebRTCHandshakeProps) => {
  const inputOfferRef = useRef<HTMLInputElement>(null);
  const inputAnswerRef = useRef<HTMLInputElement>(null);

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
    </div>
  );
}
