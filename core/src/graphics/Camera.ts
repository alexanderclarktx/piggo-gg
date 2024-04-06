import { Renderer, Renderable } from "@piggo-gg/core";
import { Container } from "pixi.js";

const scaleMin = 1;
const scaleMax = 2;

// Camera handles the viewport of the game
export class Camera {
  renderables: Set<Renderable> = new Set();
  renderer: Renderer;
  c: Container = new Container();

  scale = 1;

  constructor(renderer: Renderer) {
    this.renderer = renderer;

    this.c.sortableChildren = true;
    this.c.zIndex = 0;
    this.c.alpha = 1;

    this.rescale();
  }

  rescale = () => {
    if (this.scale < scaleMin) {
      this.scale = scaleMin;
    } else if (this.scale > scaleMax) {
      this.scale = scaleMax;
    }

    this.c.scale.set(this.scale, this.scale);
  }

  rescaleDelta = (delta: number) => {
    this.scale += delta;
    this.rescale();
  }

  add = (r: Renderable) => {
    this.renderables.add(r);
    this.c.addChild(r.c);
  }

  moveTo = ({ x, y }: { x: number, y: number }) => {
    this.c.x = this.renderer.app.screen.width / 2 - x * this.scale;
    this.c.y = this.renderer.app.screen.height / 2 - y * this.scale;
  }

  toWorldCoords = ({ x, y }: { x: number, y: number }) => ({
    x: x - this.c.x,
    y: y - this.c.y
  })
}
