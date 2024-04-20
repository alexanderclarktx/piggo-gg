import { Collider, Debug, Entity, Position, Renderable, World } from "@piggo-gg/core";
import { Graphics } from "pixi.js";

export type ProjectileProps = {
  radius: number
  pos?: { x: number, y: number, vx: number, vy: number }
}

export const Projectile = ({ radius, pos }: ProjectileProps) => {
  const projectile = Entity({
    id: `projectile-${Math.trunc(Math.random() * 1000000)}`,
    components: {
      debug: new Debug(),
      position: new Position(pos ? { x: pos.x, y: pos.y, velocityX: pos.vx, velocityY: pos.vy } : { x: 200, y: 200, velocityX: 50, velocityY: 0 }),
      collider: new Collider({
        shape: "ball",
        radius: radius ?? 10,
        sensor: (e2: Entity<Position>, world: World) => {
          if (e2.components.health) {
            e2.components.health.data.health -= 25;
            world.removeEntity(projectile.id);
          }
        }
      }),
      renderable: new Renderable({
        zIndex: 3,
        setup: async (r: Renderable) => {
          const g = new Graphics();
          g.circle(0, 0, radius ?? 10);
          g.fill(0xffff00);

          r.c = g;
        }
      })
    }
  })

  return projectile
}
