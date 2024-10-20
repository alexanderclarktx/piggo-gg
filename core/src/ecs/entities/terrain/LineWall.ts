import { Collider, Entity, Health, Networked, Position, Renderable, XY } from "@piggo-gg/core";
import { Graphics } from "pixi.js";

export type LineWallProps = {
  points: number[]
  position?: XY
  visible?: boolean
  health?: number
  hittable?: boolean
  id?: string
}

export const LineWall = ({ points, position, visible, health, id, hittable }: LineWallProps) => {

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
      position: Position({ x: position?.x ?? points[0], y: position?.y ?? points[1] }),
      ...health ? { health: Health({ health, showHealthBar: false }) } : {},
      networked: Networked({ isNetworked: true }),
      collider: Collider({
        shape: "line",
        isStatic: true,
        points: newPoints,
        priority: 1,
        hittable: hittable ?? true
      }),
      renderable: Renderable({
        visible: visible ?? false,
        zIndex: 3,
        dynamic: (g: Graphics) => {
          if (!wall.components.health) return;
          const { health, maxHealth } = wall.components.health.data;
          if (health <= 0) return;

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
