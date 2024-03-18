import { Entity, Position, Renderable, Renderer } from "@piggo-gg/core";
import { Graphics } from "pixi.js";

export const Cursor = (): Entity => {

  const cursor = Entity<Renderable | Position>({
    id: "cursor",
    components: {
      position: new Position({ x: 2000, y: 2000, screenFixed: true }),
      renderable: new Renderable({
        container: async (r: Renderer) => {
          r.props.canvas.addEventListener("mousemove", (event) => {
            const rect = r.props.canvas.getBoundingClientRect();

            cursor.components.position.data.x = Math.round(event.clientX - rect.left - 2);
            cursor.components.position.data.y = Math.round(event.clientY - rect.top - 2);
          });

          const circle = new Graphics();
          circle.circle(0, 0, 4);
          circle.fill({ color: 0x00FFFF });

          return circle;
        },
        zIndex: 10
      })
    }
  });

  return cursor;
}
