import { Container, Graphics } from "pixi.js";
import { Renderer } from "./Renderer";

export type RenderableOptions = {
  debuggable?: boolean;
}

export class Renderable extends Container {
  id: string;
  debugGraphics = new Graphics();
  renderer: Renderer;

  constructor(renderer: Renderer, options?: RenderableOptions) {
    super();
    this.renderer = renderer;

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
    const bounds = this.getLocalBounds();
    this.debugGraphics.clear();
    this.debugGraphics.lineStyle(1, 0xFF0000);
    this.debugGraphics.drawRect(bounds.x + 1, bounds.y + 1, bounds.width - 2, bounds.height - 2);
  }
}
