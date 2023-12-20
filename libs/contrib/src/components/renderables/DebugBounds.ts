import { Graphics, Container } from "pixi.js";
import { Renderable, RenderableProps } from "@piggo-legends/contrib";

export type DebugBoundsProps = RenderableProps & {
  renderable: Renderable
}

export class DebugBounds extends Renderable<DebugBoundsProps> {
  constructor(props: DebugBoundsProps) {
    super({
      ...props,
      debuggable: false,
      zIndex: 3
    });
    this.init(props.renderable);
  }

  init = (r: Renderable) => {
    const drawing = new Graphics();

    const bounds = r.c.getLocalBounds();

    // rectangle around bounds
    drawing.lineStyle(1, 0xff0000);
    drawing.drawRect(bounds.x, bounds.y, bounds.width, bounds.height);

    // circle at center
    drawing.beginFill(0xff0000);
    drawing.drawCircle(0, 0, 2);
    drawing.endFill();

    this.c.addChild(drawing);
  }
}
