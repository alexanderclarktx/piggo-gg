import { Renderer, World, IsometricWorld } from "@piggo-gg/core";
import { Legends, Soccer, Strike } from "@piggo-gg/games";
import React, { useEffect } from "react";

export type GameCanvasProps = {
  setWorld: (_: World) => void
}

const isMobile = (): boolean => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

export const GameCanvas = ({ setWorld }: GameCanvasProps) => {

  console.log("isMobile", isMobile());

  useEffect(() => {

    const mobile = isMobile();
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;

    const { width, height } = mobile ?
      { width: window.innerWidth, height: window.innerHeight } :
      { width: window.innerWidth * 0.98, height: window.innerHeight * 0.90 };

      console.log("width", width, height);

    // remove border styling if mobile
    if (mobile) {
      canvas.style.border = "none";
    }

    const renderer = new Renderer({ canvas, width, height });

    renderer.init().then(() => {
      const world = IsometricWorld({ renderer, runtimeMode: "client", games: [Soccer, Strike, Legends] });
      setWorld(world);
    })
  }, []);

  return (
    <canvas id="canvas" />
  );
}
