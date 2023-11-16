import { Game, RtcPeer, RtcPool } from "@piggo-legends/core";
import { Playground } from "@piggo-legends/playground";
import { Renderer } from "@piggo-legends/core";
import React, { useEffect } from "react";

export type GameCanvasProps = {
  net: RtcPool
  setGame: (game: Game<any>) => void
}
export const GameCanvas = ({ net, setGame }: GameCanvasProps) => {

  useEffect(() => {
    if (RtcPeer) {
      const renderer = new Renderer(document.getElementById("canvas") as HTMLCanvasElement);
      setGame(
        new Playground({
          net: net,
          renderer: renderer,
          entities: {},
          systems: [],
        })
      );
    }
  }, [RtcPeer]);

  return (
    <canvas style={{marginBottom: 0}} id="canvas"/>
  );
}
