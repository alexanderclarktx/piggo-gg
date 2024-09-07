import { Entity, Position, Renderable, Renderer, round } from "@piggo-gg/core";
import { Graphics } from "pixi.js";

export const Cursor = (): Entity => {

  const cursor = Entity<Renderable | Position>({
    id: "cursor",
    components: {
      position: Position({ x: 2000, y: 2000, screenFixed: true }),
      renderable: Renderable({
        interpolate: true,
        setContainer: async (r: Renderer) => {
          r.props.canvas.addEventListener("mousemove", (event) => {
            const rect = r.props.canvas.getBoundingClientRect();

            cursor.components.position.data.x = round(event.clientX - rect.left - 2);
            cursor.components.position.data.y = round(event.clientY - rect.top - 2);
          });

          const circle = new Graphics();
          circle.circle(0, 0, 4);
          circle.fill({ color: 0x00FFFF });

          return circle;
        },
        zIndex: 12
      })
    }
  });

  return cursor;
}
