import "@pixi/unsafe-eval";
import React, { useEffect, useState } from "react";
import { Game, NetManager } from "@piggo-legends/gamertc";
import { NetConnector } from "./NetConnector";
import { NetState } from "../types/NetState";
import { Header } from "./Header";
import { GameCanvas } from "./GameCanvas";
import { PhoneCall } from "./PhoneCall";

// webpage root component
export const Root = () => {
  // initialize all not-component-local state
  const [netManager, setNetManager] = useState<NetManager | undefined>();
  const [game, setGame] = useState<Game<any> | undefined>();
  const [sdp, setSdp] = useState({ local: "", remote: "" });
  const [theirMediaStream, setTheirMediaStream] = useState<MediaStream | undefined>();
  const [netState, setNetState] = useState<NetState>("none");
  const [modalOpen, setModalOpen] = useState(false);

  // expose the game client to the console
  useEffect(() => {
    (window as any).game = game;
  }, [game]);

  // initialize the net manager
  useEffect(() => {
    setNetManager(new NetManager(
      (local: string) => setSdp({ local: btoa(local), remote: sdp.remote }),
      (stream: MediaStream) => setTheirMediaStream(stream),
      () => setNetState("connected")
    ));
  }, []);

  return (
    <div>
      <Header/>
      <GameCanvas
        netManager={netManager}
        setGame={setGame}
      />
      <NetConnector
        netManager={game?.props.net}
        sdp={sdp}
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        netState={netState}
        setNetState={setNetState}
      />
      <PhoneCall
        netManager={netManager}
        netState={netState}
        theirMediaStream={theirMediaStream}
      />
    </div>
  );
}
