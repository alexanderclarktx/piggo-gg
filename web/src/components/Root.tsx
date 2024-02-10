import { Game, RtcPool } from "@piggo-legends/core";
import "@pixi/unsafe-eval";
import { compressToBase64 } from "lz-string";
import React, { useEffect, useState } from "react";
import { NetState } from "../types/NetState";
import { GameCanvas } from "./GameCanvas";
import { Header } from "./Header";
import { NetConnector } from "./NetConnector";

// Piggo Legends webapp root component
export const Root = () => {
  // initialize all not-component-local state
  const [game, setGame] = useState<Game | undefined>();
  const [sdp, setSdp] = useState({ local: "", remote: "" });
  const [netState, setNetState] = useState<NetState>("disconnected");
  const [modalOpen, setModalOpen] = useState(false);

  const [pool] = useState<RtcPool>(new RtcPool(
    (local: string) => setSdp({ local: compressToBase64(local), remote: sdp.remote }),
    () => setNetState("connected")
  ));

  // expose the game client to the console
  useEffect(() => {
    (window as any).game = game;
  }, [game]);

  return (
    <div>
      <div>
        <div style={{ width: "fit-content", display: "block", marginLeft: "auto", marginRight: "auto" }}>
          <Header />
          <NetConnector
            net={pool}
            sdp={sdp}
            modalOpen={modalOpen}
            setModalOpen={setModalOpen}
            netState={netState}
            setNetState={setNetState}
          />
          <GameCanvas
            net={pool}
            setGame={setGame}
          />
        </div>
      </div>
    </div>
  );
}
