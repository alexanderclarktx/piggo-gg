import { Debug, Entity, Renderer } from "@piggo-gg/core";
import { Position, Renderable } from "@piggo-gg/core";
import { Graphics } from "pixi.js";

export const Cursor = (): Entity => {

  const cursor = {
    id: "cursor",
    components: {
      position: new Position({ x: 2000, y: 2000, screenFixed: true }),
      debug: new Debug(),
      renderable: new Renderable({
        container: async (r: Renderer) => {
          r.props.canvas.addEventListener("mousemove", (event) => {
            const rect = r.props.canvas.getBoundingClientRect();

            cursor.components.position.data.x = Math.round(event.clientX - rect.left - 2);
            cursor.components.position.data.y = Math.round(event.clientY - rect.top - 2);
          });

          const circle = new Graphics();
          circle.beginFill(0x00FFFF);
          circle.drawCircle(0, 0, 4);
          circle.endFill();

          return circle;
        },
        zIndex: 10
      })
    }
  }

  return cursor;
}
