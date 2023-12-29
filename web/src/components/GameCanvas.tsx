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
        width: window.outerWidth * 0.9,
        height: window.outerHeight * 0.75
      });
      setGame(new Playground({ net, renderer }));
    }
  }, [RtcPeer]);

  return (
    <canvas style={{ marginBottom: 0 }} id="canvas" />
  );
}
