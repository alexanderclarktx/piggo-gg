import { RtcPool } from "@piggo-legends/core";
import { decompressFromBase64 } from "lz-string";
import React, { useEffect, useRef } from "react";
import ReactModal from "react-modal";
import { NetState, NetStateColor } from "../types/NetState";

export type rtcNetConnectorProps = {
  net: RtcPool
  sdp: { local: string, remote: string }
  modalOpen: boolean
  setModalOpen: (open: boolean) => void
  netState: NetState
  setNetState: (state: NetState) => void
}

// the NetConnector component creates and accepts WebRTC SDP offers/answers
export const RtcNetConnector = ({ net, sdp, modalOpen, setModalOpen, netState, setNetState }: rtcNetConnectorProps) => {
  const inputOfferRef = useRef<HTMLInputElement>(null);
  const inputAnswerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (netState === "connected") {
      setModalOpen(false);
    }
  }, [netState]);

  const createOffer = () => {
    setNetState("offering");
    net.createOffer();
  }

  const acceptOffer = () => {
    // const offerDecoded = btoa(inputOfferRef.current ? inputOfferRef.current.value : "");
    const offerDecoded = decompressFromBase64(inputOfferRef.current ? inputOfferRef.current.value : "");
    net.acceptOffer(offerDecoded.slice(1, offerDecoded.length - 1));
    setNetState("answering");
  }

  const acceptAnswer = () => {
    // const answerDecoded = btoa(inputAnswerRef.current ? inputAnswerRef.current.value : "");
    const answerDecoded = decompressFromBase64(inputAnswerRef.current ? inputAnswerRef.current.value : "");
    net.acceptAnswer(answerDecoded.slice(1, answerDecoded.length - 1));
  }

  return (
    <div style={{"paddingTop": 0}}>
      <div>
        <ReactModal
          ariaHideApp={false}
          isOpen={modalOpen}
          shouldCloseOnOverlayClick={true}
          onRequestClose={() => setModalOpen(false)}
          style={{
            overlay: {
              backgroundColor: "rgba(0, 0, 0, 0.4)",
              alignContent: "center",
              justifyContent: "center",
            },
            content: {
              alignContent: "center",
              alignSelf: "center",
              marginLeft: "10%",
              marginRight: "10%",
              marginTop: "10%",
              marginBottom: "10%",
              maxWidth: "80%",
              maxHeight: "80%",
              backgroundColor: "rgba(10, 10, 10, 0.5)",
              color: "white"
            },
          }}
        >
          <div>
            <div>
              <button hidden={netState !== "disconnected"} onClick={createOffer}>Create Offer</button>
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
      <div style={{ width: "100%", verticalAlign: "middle" }}>
        <div style={{ float: "left", marginLeft: 2, marginTop: 1 }}>
          status: <span style={{ color: NetStateColor[netState] }}>{netState}</span>
        </div>
        <button style={{ float: "right", marginTop: 0, marginRight: 2, fontSize: 12 }} onClick={() => setModalOpen(true)}>Connect to Peer</button>
      </div>
    </div>
  );
}