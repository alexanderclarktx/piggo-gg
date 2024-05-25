import { Graphics } from "pixi.js";
import { Renderable, RenderableProps } from "@piggo-gg/core";

export type DebugBoundsProps = RenderableProps & {
  debugRenderable: Renderable
}

export const DebugBounds = (props: DebugBoundsProps): Renderable => {

  const renderable = new Renderable({
    ...props,
    setup: async (r: Renderable) => {

      // get the bounds of the renderable
      const bounds = props.debugRenderable.c.getLocalBounds();
      if (bounds.width === 0 && bounds.height === 0) {
        setTimeout(() => renderable.setup?.(r, renderable.renderer), 100);
        return;
      }

      const drawing = new Graphics();

      // center circle
      drawing.circle(0, 0, 2);
      drawing.fill(0xff00ff);

      // bounds rectangle
      drawing.setStrokeStyle({ width: 1, color: 0xff0000 });
      drawing.rect(bounds.x, bounds.y, bounds.width, bounds.height);
      drawing.stroke();

      r.c.addChild(drawing);
    }
  })

  return renderable;
}
