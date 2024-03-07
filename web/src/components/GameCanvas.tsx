import { Renderer, World } from "@piggo-gg/core";
import { Playground, Soccer } from "@piggo-gg/games";
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
    setWorld(Soccer({ renderer, runtimeMode: "client" }));
  }, []);

  return (
    <canvas id="canvas" />
  );
}
