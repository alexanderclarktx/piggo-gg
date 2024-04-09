import { World } from "@piggo-gg/core";
import { GameCanvas, Header, NetState } from "@piggo-gg/web";
import React, { useEffect, useState } from "react";

const isMobile = (): boolean => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

// Piggo webapp root component
export const Root = () => {

  const mobile = isMobile();

  const [world, setWorld] = useState<World | undefined>();
  const [netState, setNetState] = useState<NetState>("disconnected");

  // expose the game client to the console
  useEffect(() => {
    (window as any).world = world;
  }, [world]);

  return (
    <div>
      <div>
        <div style={{ width: "fit-content", display: "block", marginLeft: "auto", marginRight: "auto" }}>
          {mobile ? null :
            <Header
              netState={netState}
              setNetState={setNetState}
              world={world}
            />
          }
          <GameCanvas setWorld={setWorld} />
        </div>
      </div>
    </div>
  );
}
