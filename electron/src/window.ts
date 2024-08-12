import { Strike, Home, ARAM, Soccer, Legends } from "@piggo-gg/games";
import { IsometricWorld, Renderer } from "@piggo-gg/core";

window.onload = () => {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;

  const [width, height] = [600, 800];

  const renderer = Renderer({ canvas, width, height });

  renderer.init().then(() => {
    IsometricWorld({ renderer, runtimeMode: "client", games: [Strike, Home, ARAM, Soccer, Legends] });
  });
}
