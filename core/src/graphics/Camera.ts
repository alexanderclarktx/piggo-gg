import { Renderer, Renderable } from "@piggo-gg/core";
import { Container } from "pixi.js";

export type Camera = {
  c: Container
  add: (r: Renderable) => void
  rescaleDelta: (delta: number) => void
  moveTo: ({ x, y }: { x: number, y: number }) => void
  toWorldCoords: ({ x, y }: { x: number, y: number }) => { x: number, y: number }
}

// Camera handles the viewport of the game
export const Camera = (renderer: Renderer): Camera => {

  const renderables: Set<Renderable> = new Set();
  const c: Container = new Container({ sortableChildren: true, zIndex: 0, alpha: 1 });
  let scale = 1.2;

  const rescale = () => {
    const min = 1;
    const max = 2;

    if (scale < min) scale = min;
    if (scale > max) scale = max;

    c.scale.set(scale, scale);
  }

  rescale();

  return {
    c,
    add: (r: Renderable) => {
      renderables.add(r);
      c.addChild(r.c);
    },
    rescaleDelta: (delta: number) => {
      scale += delta;
      rescale();
    },
    moveTo: ({ x, y }: { x: number, y: number }) => {
      c.x = renderer.app.screen.width / 2 - x * scale;
      c.y = renderer.app.screen.height / 2 - y * scale;
    },
    toWorldCoords: ({ x, y }: { x: number, y: number }) => ({
      x: (x - c.x) / scale,
      y: (y - c.y) / scale
    })
  }
}
