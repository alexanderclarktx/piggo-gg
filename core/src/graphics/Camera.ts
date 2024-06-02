import { Renderable, Renderer, XY } from "@piggo-gg/core";
import { Application, Container } from "pixi.js";

export type Camera = {
  c: Container
  add: (r: Renderable) => void
  rescaleDelta: (delta: number) => void
  moveBy: ({ x, y }: XY) => void
  moveTo: ({ x, y }: XY) => void
  toWorldCoords: ({ x, y }: XY) => XY
}

// Camera handles the viewport of the game
export const Camera = (app: Application): Camera => {

  const renderables: Set<Renderable> = new Set();
  const c: Container = new Container({ sortableChildren: true, zIndex: 0, alpha: 1 });
  let scale = 1.4;

  const rescale = () => {
    const min = 1.2;
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
    moveBy: ({ x, y }: XY) => {
      c.x += x;
      c.y += y;
    },
    moveTo: ({ x, y }: XY) => {
      c.x = app.screen.width / 2 - x * scale;
      c.y = app.screen.height / 2 - y * scale;
    },
    toWorldCoords: ({ x, y }: XY) => ({
      x: (x - c.x) / scale,
      y: (y - c.y) / scale
    })
  }
}
