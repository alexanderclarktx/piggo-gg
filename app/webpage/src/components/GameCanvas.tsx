import { Game, GameClient, NetManager } from "@piggo-legends/gamertc";
import { Pong } from "@piggo-legends/pong";
import { Renderer } from "@piggo-legends/gamertc";
import React, { useEffect, useState } from "react";

export type GameCanvasProps = {
  netManager?: NetManager
  setGameClient: (gameClient: GameClient) => void
}
export const GameCanvas = ({ netManager, setGameClient }: GameCanvasProps) => {

  useEffect(() => {
    if (netManager) {
      const renderer = new Renderer(document.getElementById("canvas") as HTMLCanvasElement);
      setGameClient(
        new GameClient(
          netManager,
          new Pong(renderer),
          renderer
        )
      );
    }
  }, [netManager]);

  return (
    <canvas id="canvas"/>
  );
}
