import { NetManager } from "@piggo-legends/gamertc";
import React, { useEffect, useRef } from "react";
import ReactModal from "react-modal";
import { NetState } from "../types/NetState";
import * as lz from "lz-string"

export type WebRTCHandshakeProps = {
  netManager?: NetManager
  sdp: { local: string, remote: string }
  modalOpen: boolean
  setModalOpen: (open: boolean) => void
  netState: NetState
  setNetState: (state: NetState) => void
}

// the NetConnector component creates and accepts WebRTC SDP offers/answers
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
    // const offerDecoded = btoa(inputOfferRef.current ? inputOfferRef.current.value : "");
    const offerDecoded = lz.decompressFromBase64(inputOfferRef.current ? inputOfferRef.current.value : "");
    netManager?.acceptOffer(offerDecoded.slice(1, offerDecoded.length - 1));
    setNetState("answering");
  }

  const acceptAnswer = () => {
    // const answerDecoded = btoa(inputAnswerRef.current ? inputAnswerRef.current.value : "");
    const answerDecoded = lz.decompressFromBase64(inputAnswerRef.current ? inputAnswerRef.current.value : "");
    netManager?.acceptAnswer(answerDecoded.slice(1, answerDecoded.length - 1));
  }

  return (
    <div>
      <div>
        <ReactModal
          ariaHideApp={false}
          isOpen={modalOpen}
          shouldCloseOnOverlayClick={true}
          onRequestClose={()=>setModalOpen(false)}
          style={{
            overlay: {
              backgroundColor: "rgba(230, 230, 230, 0.3)",
            },
            content: {
              backgroundColor: "rgba(230, 240, 250, 1)",
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
