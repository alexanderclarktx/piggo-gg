import { Graphics } from "pixi.js";
import { Renderable, RenderableProps } from "@piggo-legends/core";

export type DebugBoundsProps = RenderableProps & {
  debugRenderable: Renderable
}

export class DebugBounds extends Renderable<DebugBoundsProps> {
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
    drawing.beginFill(0xff00ff);
    drawing.drawCircle(0, 0, 2);
    drawing.endFill();

    // rectangle around bounds
    drawing.lineStyle(1, 0xff0000);
    drawing.drawRect(bounds.x, bounds.y, bounds.width, bounds.height);

    this.c.addChild(drawing);
  }
}
