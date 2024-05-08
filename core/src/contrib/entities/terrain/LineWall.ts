import { Collider, Debug, Entity, Health, Networked, Position, Renderable } from "@piggo-gg/core";
import { Graphics } from "pixi.js";

export type LineWallProps = {
  points: number[]
  position?: { x: number, y: number }
  visible?: boolean
  health?: number
  shootable?: boolean
  id?: string
}

export const LineWall = ({ points, position, visible, health, id, shootable }: LineWallProps) => {

  let newPoints: number[] = [];

  if (position) {
    newPoints = points;
  } else {
    newPoints = points.map((point, i) => {
      if (i % 2 === 0) {
        return point - points[0];
      } else {
        return point - points[1];
      }
    });
  }

  const wall = Entity({
    id: id ?? `linewall-${points.join("-")}`,
    components: {
      position: new Position({ x: position?.x ?? points[0], y: position?.y ?? points[1] }),
      debug: new Debug(),
      health: new Health({ health: health ?? 9999, maxHealth: health ?? 9999, showHealthBar: false }),
      networked: new Networked({ isNetworked: true }),
      collider: new Collider({
        shape: "line",
        isStatic: true,
        points: newPoints,
        priority: 1,
        shootable: shootable ?? true
      }),
      renderable: new Renderable({
        visible: visible ?? false,
        zIndex: 3,
        dynamic: (g: Graphics) => {
          if (!wall.components.health) return;
          const { health, maxHealth } = wall.components.health.data;

          const white = 255 * health / maxHealth;
          g.tint = (white << 16) + (255 << 8) + 255;
        },
        setContainer: async () => {
          const g = new Graphics();
          for (let i = 2; i < newPoints.length; i += 2) {
            g.lineTo(newPoints[i], newPoints[i + 1]);
          }
          g.stroke({ width: 2, color: 0xffffff });
          return g;
        }
      })
    }
  });
  return wall;
}
