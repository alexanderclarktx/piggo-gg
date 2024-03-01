import { World } from "@piggo-legends/core";
import "@pixi/unsafe-eval";
import React, { useEffect, useState } from "react";
import { NetState } from "../types/NetState";
import { GameCanvas } from "./GameCanvas";
import { Header } from "./Header";

// Piggo Legends webapp root component
export const Root = () => {
  // initialize all not-component-local state
  const [world, setWorld] = useState<World | undefined>();
  const [netState, setNetState] = useState<NetState>("disconnected");
  const [modalOpen, setModalOpen] = useState(false);

  // expose the game client to the console
  useEffect(() => {
    (window as any).world = world;
  }, [world]);

  return (
    <div>
      <div>
        <div style={{ width: "fit-content", display: "block", marginLeft: "auto", marginRight: "auto" }}>
          <Header
            netState={netState}
            setNetState={setNetState}
            world={world}
          />
          <GameCanvas setWorld={setWorld} />
        </div>
      </div>
    </div>
  );
}
