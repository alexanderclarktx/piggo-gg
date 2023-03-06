import { GameClient, NetManager } from "@piggo-legends/gamertc";
import { Renderer } from "@piggo-legends/gamertc/src/graphics/Renderer";
import React, { useEffect } from "react";

export type GameCanvasProps = {
  netManager?: NetManager
  setGameClient: (gameClient: GameClient) => void
}
export const GameCanvas = ({ netManager, setGameClient }: GameCanvasProps) => {

  useEffect(() => {
    if (netManager) {
      setGameClient(
        new GameClient(
          netManager,
          undefined,
          new Renderer(document.getElementById("canvas") as HTMLCanvasElement)
        )
      );
    }
  }, [netManager]);

  return (
    <canvas id="canvas"/>
  );
}
