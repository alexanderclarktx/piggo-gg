import "@pixi/unsafe-eval";
import React, { useEffect, useState } from "react";
import { Game, RtcPool } from "@piggo-legends/core";
import { NetConnector } from "./NetConnector";
import { NetState } from "../types/NetState";
import { Header } from "./Header";
import { GameCanvas } from "./GameCanvas";
import * as lz from "lz-string"

// web app root component
export const Root = () => {
  // initialize all not-component-local state
  const [game, setGame] = useState<Game<any> | undefined>();
  const [sdp, setSdp] = useState({ local: "", remote: "" });
  const [netState, setNetState] = useState<NetState>("none");
  const [modalOpen, setModalOpen] = useState(false);
  const [pool] = useState<RtcPool>(new RtcPool(
    (local: string) => setSdp({ local: lz.compressToBase64(local), remote: sdp.remote }),
    () => setNetState("connected")
  ));

  // expose the game client to the console
  useEffect(() => {
    (window as any).game = game;
  }, [game]);

  return (
    <div>
      <Header/>
      <GameCanvas
        net={pool}
        setGame={setGame}
      />
      <NetConnector
        net={pool}
        sdp={sdp}
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        netState={netState}
        setNetState={setNetState}
      />
    </div>
  );
}
