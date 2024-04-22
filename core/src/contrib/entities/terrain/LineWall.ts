import { Collider, Debug, Entity, Health, Networked, Position, Renderable } from "@piggo-gg/core";
import { Graphics } from "pixi.js";

export type LineWallProps = {
  points: number[]
  draw?: boolean
}

export const LineWall = ({ points, draw }: LineWallProps) => {

  const newPoints = points.map((point, i) => {
    if (i % 2 === 0) {
      return point - points[0];
    } else {
      return point - points[1];
    }
  });

  const wall = Entity<Health>({
    id: `linewall-${points.join("-")}`,
    components: {
      position: new Position({ x: points[0], y: points[1] }),
      debug: new Debug(),
      health: new Health(75, 75, false),
      networked: new Networked({ isNetworked: true }),
      collider: new Collider({
        shape: "line",
        isStatic: true,
        points: newPoints
      }),
      ...draw && {
        renderable: new Renderable({
          zIndex: 3,
          dynamic: (g: Graphics) => {
            const { health, maxHealth } = wall.components.health.data;

            const white = 255 * health / maxHealth;
            g.tint = (white << 16) + (255 << 8) + 255;
          },
          container: async () => {
            const g = new Graphics();
            for (let i = 2; i < newPoints.length; i += 2) {
              g.lineTo(newPoints[i], newPoints[i + 1]);
            }
            g.stroke({ width: 2, color: 0xffffff });
            return g;
          }
        })
      }
    }
  });
  return wall;
}
