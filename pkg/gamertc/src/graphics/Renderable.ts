import { Container, Graphics, Sprite } from "pixi.js";
import { Renderer } from "./Renderer";

export type RenderableProps = {
  debuggable?: boolean;
  pos?: { x: number; y: number };
}

export class Renderable extends Container {
  id: string;
  debugGraphics = new Graphics();
  renderer: Renderer;

  constructor(renderer: Renderer, options?: RenderableProps) {
    super();
    this.renderer = renderer;
    this.position.set(options?.pos?.x || 0, options?.pos?.y || 0);

    // debug outline
    if (!(options?.debuggable === false)) {
      this.addChild(this.debugGraphics);
      this.debugGraphics.visible = this.renderer.debug;

      this.on("childAdded", () => {
        this.updateDebugGraphics();
      });

      this.renderer.events.on("debug", () => {
        console.log("debug");
        this.debugGraphics.visible = this.renderer.debug;
        this.updateDebugGraphics();
      });
    }
  }

  updateDebugGraphics = () => {
    // update alpha for all sprites in this container
    for (const child of this.children) {
      if (child instanceof Sprite) {
        child.alpha = this.renderer.debug ? 0.5 : 1;
      }
    }

    // draw a rectangle around the container
    const bounds = this.getLocalBounds();
    this.debugGraphics.clear();
    this.debugGraphics.lineStyle(1, 0xFF0000);
    this.debugGraphics.drawRect(bounds.x + 1, bounds.y + 1, bounds.width - 2, bounds.height - 2);

    // draw a circle at origin
    this.debugGraphics.lineStyle(1, 0x00FF00, 0.9);
    this.debugGraphics.drawCircle(0, 0, 2);

    // draw a circle at pivot
    this.debugGraphics.lineStyle(1, 0xFF00FF, 0.9);
    this.debugGraphics.drawCircle(this.pivot.x, this.pivot.y, 2);
  }
}
