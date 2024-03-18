import { Graphics } from "pixi.js";
import { Renderable, RenderableProps } from "@piggo-gg/core";

export type DebugBoundsProps = RenderableProps & {
  debugRenderable: Renderable
}

export class DebugBounds extends Renderable {
  constructor(props: DebugBoundsProps) {
    super(props);
    this.init(props.debugRenderable);
  }

  init = (r: Renderable) => {
    const drawing = new Graphics();
    const bounds = r.c.getLocalBounds();
    if (bounds.width === 0 && bounds.height === 0) {
      setTimeout(() => this.init(r), 100);
      return;
    }

    // circle at center
    drawing.circle(0, 0, 2);
    drawing.fill(0xff00ff);

    // rectangle around bounds
    drawing.setStrokeStyle({width: 1,  color: 0xff0000 });
    drawing.rect(bounds.x, bounds.y, bounds.width, bounds.height);
    drawing.stroke();

    this.c.addChild(drawing);
  }
}
