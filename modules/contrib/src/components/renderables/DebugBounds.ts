import { Graphics } from "pixi.js";
import { Renderable, RenderableProps } from "@piggo-legends/contrib";

export type DebugBoundsProps = RenderableProps & {
  debugRenderable: Renderable
}

export class DebugBounds extends Renderable<DebugBoundsProps> {
  constructor(props: DebugBoundsProps) {
    super({ ...props, debuggable: false });
    this.init(props.debugRenderable);
  }

  init = (r: Renderable) => {
    const drawing = new Graphics();
    const bounds = r.c.getLocalBounds();

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
