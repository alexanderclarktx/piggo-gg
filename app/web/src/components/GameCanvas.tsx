import { Game, NetManager } from "@piggo-legends/core";
import { Pong } from "@piggo-legends/pong";
import { Renderer } from "@piggo-legends/core";
import React, { useEffect } from "react";

export type GameCanvasProps = {
  netManager?: NetManager
  setGame: (game: Game<any>) => void
}
export const GameCanvas = ({ netManager, setGame }: GameCanvasProps) => {

  useEffect(() => {
    if (netManager) {
      const renderer = new Renderer(document.getElementById("canvas") as HTMLCanvasElement);
      setGame(
        new Pong({
          net: netManager,
          renderer: renderer,
          entities: [],
          systems: [],
        })
      );
    }
  }, [netManager]);

  return (
    <canvas id="canvas"/>
  );
}
