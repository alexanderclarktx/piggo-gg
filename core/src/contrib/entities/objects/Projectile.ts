import { Collider, Entity, Position, Renderable, World } from "@piggo-gg/core";
import { Graphics } from "pixi.js";

export type ProjectileProps = {
  radius: number
}

export const Projectile = ({ radius }: ProjectileProps) => {

  const projectile = Entity({
    id: `projectile-${Math.trunc(Math.random() * 1000)}`,
    components: {
      position: new Position({ x: 200, y: 200, velocityX: 50, velocityY: 0 }),
      collider: new Collider({
        shape: "ball",
        radius: radius ?? 10,
        sensor: (e2: Entity<Position>, world: World) => {
          if (e2.components.health) {
            e2.components.health.data.health -= 25;
          }
          world.removeEntity(projectile.id);
        }
      }),
      renderable: new Renderable({
        zIndex: 3,
        setup: async (r: Renderable) => {
          const g = new Graphics();
          g.circle(0, 0, radius ?? 10);
          g.fill(0xff0000);

          r.c = g;
        }
      })
    }
  })

  return projectile
}
