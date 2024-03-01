import { Renderer, World } from "@piggo-legends/core";
import { Playground } from "@piggo-legends/games";
import React, { useEffect } from "react";

export type GameCanvasProps = {
  setWorld: (game: World) => void
}
export const GameCanvas = ({ setWorld }: GameCanvasProps) => {

  useEffect(() => {
    const renderer = new Renderer({
      canvas: document.getElementById("canvas") as HTMLCanvasElement,
      width: window.innerWidth * 0.98,
      height: window.innerHeight * 0.90
    });
    setWorld(Playground({ renderer, runtimeMode: "client" }));
  }, []);

  return (
    <canvas id="canvas" />
  );
}
