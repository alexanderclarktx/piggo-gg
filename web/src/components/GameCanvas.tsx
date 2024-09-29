import { IsometricWorld, Renderer, World, isMobile } from "@piggo-gg/core";
import { ARAM, Dungeon, Home, Legends, Sandbox, Soccer, Strike } from "@piggo-gg/games";
import React, { useEffect } from "react";

export type GameCanvasProps = {
  setWorld: (_: World) => void
}

export const GameCanvas = ({ setWorld }: GameCanvasProps) => {

  useEffect(() => {

    const mobile = isMobile();
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;

    const [width, height] = mobile ?
      [window.innerWidth, window.innerHeight] :
      [window.innerWidth * 0.98, window.innerHeight * 0.90];

    if (mobile) canvas.style.border = "none";

    const renderer = Renderer({ canvas, width, height });

    renderer.init().then(() => {
      const world = IsometricWorld({ renderer, runtimeMode: "client", games: [Sandbox, Dungeon, Home, Strike, ARAM, Soccer, Legends] });
      setWorld(world);
      renderer.handleResize();
    })
  }, []);

  return (
    <div>
      <audio>
        <source src="/silent.mp3" type="audio/mp3"></source>
      </audio>
      <canvas id="canvas" onPointerDown={
        () => {
          // @ts-expect-error
          if (globalThis.playedAudio) return;

          const audioElement = document.querySelector("audio") as HTMLAudioElement;
          audioElement.play();

          // @ts-expect-error
          globalThis.playedAudio = true;
        }
      }>
      </canvas>
    </div>
  );
}
