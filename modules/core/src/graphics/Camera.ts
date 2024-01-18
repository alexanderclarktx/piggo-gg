import { Renderer, Renderable } from "@piggo-legends/core";
import { Container } from "pixi.js";

// Camera handles the viewport of the game
export class Camera {
  renderables: Set<Renderable> = new Set();
  renderer: Renderer;
  c: Container = new Container();

  constructor(renderer: Renderer) {
    this.renderer = renderer;

    this.c.sortableChildren = true;
    this.c.zIndex = 0;
    this.c.alpha = 1;
  }

  add = (r: Renderable) => {
    this.renderables.add(r);
    this.c.addChild(r.c);
  }

  moveTo = ({ x, y }: { x: number, y: number }) => {
    this.c.x = this.renderer.app.screen.width / 2 - x;
    this.c.y = this.renderer.app.screen.height / 2 - y;
  }

  toWorldCoords = ({ x, y }: { x: number, y: number }) => ({
    x: x - this.c.x,
    y: y - this.c.y
  })
}
