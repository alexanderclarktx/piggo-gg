import { Game, Renderer, RtcPeer, RtcPool } from "@piggo-legends/core";
import { Playground } from "@piggo-legends/playground";
import React, { useEffect } from "react";

export type GameCanvasProps = {
  net: RtcPool
  setGame: (game: Game<any>) => void
}
export const GameCanvas = ({ net, setGame }: GameCanvasProps) => {

  useEffect(() => {
    if (RtcPeer) {
      const renderer = new Renderer({
        canvas: document.getElementById("canvas") as HTMLCanvasElement,
        width: window.innerWidth * 0.98,
        height: window.innerHeight * 0.90
      });
      setGame(new Playground({ net, renderer, runtimeMode: "client" }));
    }
  }, [RtcPeer]);

  return (
    <canvas id="canvas" />
  );
}
