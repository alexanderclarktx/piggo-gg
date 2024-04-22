import { Collider, Debug, Entity, Health, Position, Renderable } from "@piggo-gg/core";
import { Graphics } from "pixi.js";

export type LineWallProps = {
  points: number[]
  draw?: boolean
}

export const LineWall = ({ points, draw }: LineWallProps) => Entity({
  id: `linewall-${points.join("-")}`,
  components: {
    position: new Position({ x: 0, y: 0 }),
    debug: new Debug(),
    health: new Health(100, 100),
    collider: new Collider({
      shape: "line",
      isStatic: true,
      points
    }),
    ... draw && {
      renderable: new Renderable({
        zIndex: 3,
        setup: async (r: Renderable) => {
          const g = new Graphics();
          g.moveTo(points[0], points[1]);
          for (let i = 2; i < points.length; i += 2) {
            g.lineTo(points[i], points[i + 1]);
          }
          g.stroke({ width: 2, color: 0xffffff });
          r.c.addChild(g);
        }
      })
    }
  }
});
