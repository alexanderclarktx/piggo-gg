import { IsometricWorld, Renderer, World, isMobile } from "@piggo-gg/core";
import { ARAM, Home, Legends, Soccer, Strike } from "@piggo-gg/games";
import React, { useEffect } from "react";

export type GameCanvasProps = {
  setWorld: (_: World) => void
}

export const GameCanvas = ({ setWorld }: GameCanvasProps) => {

  useEffect(() => {

    const mobile = isMobile();
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;

    const { width, height } = mobile ?
      { width: window.innerWidth, height: window.innerHeight } :
      { width: window.innerWidth * 0.98, height: window.innerHeight * 0.90 };

    if (mobile) canvas.style.border = "none";

    const renderer = Renderer({ canvas, width, height });

    renderer.init().then(() => {
      const world = IsometricWorld({ renderer, runtimeMode: "client", games: [Home, Strike,  ARAM, Soccer, Legends] });
      setWorld(world);
    })
  }, []);

  return (
    <canvas id="canvas" />
  );
}
