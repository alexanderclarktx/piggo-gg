import { Collider, Entity, Expires, Networked, Position, Renderable, World, pixiCircle } from "@piggo-gg/core";

export type ProjectileProps = {
  id: string
  radius: number
  pos?: { x: number, y: number, vx: number, vy: number }
}

export const Projectile = ({ radius, pos, id }: ProjectileProps) => {
  const projectile = Entity({
    id,
    components: {
      position: new Position(pos ? pos : { x: 200, y: 200, vx: 50, vy: 0 }),
      networked: new Networked({ isNetworked: true }),
      expires: new Expires({ ticksLeft: 60 }),
      collider: new Collider({
        shape: "ball",
        radius: radius ?? 10,
        sensor: (e2: Entity<Position | Collider>, world: World) => {
          if (e2.components.collider.shootable) {
            if (e2.components.health) {
              const { renderable, health } = e2.components;
              if (renderable && health) {
                // const before = renderable.color;
                // const ratio = health.data.health / health.data.maxHealth;
                // console.log(ratio);
                // renderable.color -= 0x110000;
                // renderable.color += (ratio * 0xff0000)
                // renderable.color = 0x00ff00 + (0x110000 * (health.data.health / health.data.maxHealth));
                // renderable.color = renderable.color ^ 0x110000;
                // console.log(`before ${before.toString(16)} after ${renderable.color.toString(16)}`);
              }
              
              if (health) {
                health.data.health -= 25; // TODO configurable
              }
            }
            world.removeEntity(projectile.id);
          }
        }
      }),
      renderable: new Renderable({
        zIndex: 3,
        setContainer: async () => {
          return pixiCircle({ x: 0, y: 0, r: radius ?? 8, style: { color: 0xffff00, alpha: 1 } });
        }
      })
    }
  })

  return projectile
}
